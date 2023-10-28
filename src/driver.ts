import {
  Configuration,
  Connection,
  CountOptions,
  DatabaseDriver,
  EntityData,
  EntityDictionary,
  FilterQuery,
  FindOneOptions,
  FindOptions,
  IDatabaseDriver,
  QueryResult,
} from '@mikro-orm/core'
import { InMemoryPlatform } from './platform'
import { InMemoryConnection } from './connection'
import { Query } from 'mingo'
import { OperatorMap } from '@mikro-orm/core/typings'
import omit from 'lodash.omit'

export class InMemoryDriver extends DatabaseDriver<Connection> {
  constructor(config: Configuration<IDatabaseDriver<Connection>>, dependencies: string[] = []) {
    super(config, dependencies)
  }

  protected override readonly connection = new InMemoryConnection(this.config)
  protected override readonly platform = new InMemoryPlatform()

  override async findOne<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: FindOneOptions<T, P> | undefined
  ): Promise<EntityData<T> | null> {
    return this._find(entityName, where, options).next() ?? null
  }

  override async find<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: FindOptions<T, P> | undefined
  ): Promise<EntityData<T>[]> {
    return this._find(entityName, where, options).all()
  }

  override async nativeInsert<T extends object>(
    entityName: string,
    data: EntityDictionary<T>
  ): Promise<QueryResult<T>> {
    const collection = this._collection(entityName)
    const exists = new Query(this._pkWhere(entityName, data)).find(collection).all()
    if (exists.length) {
      throw new Error('exists')
    }
    collection.push(this._provideDefaults(entityName, data))
    return {
      affectedRows: 1,
      insertId: this._pkValue(entityName, data),
    }
  }

  override nativeInsertMany<T extends object>(): Promise<QueryResult<T>> {
    // entityName: string,
    // data: EntityDictionary<T>[],
    // options?: NativeInsertUpdateManyOptions<T> | undefined
    return null as any
  }

  override async nativeUpdate<T extends object>(
    entityName: string,
    where: FilterQuery<T>,
    data: EntityDictionary<T>
  ): Promise<QueryResult<T>> {
    const collection = this._collection(entityName)
    const docs = new Query(where as any).find<EntityData<T>[]>(collection).all()
    docs.forEach(doc => Object.assign(doc, data))
    return {
      affectedRows: docs.length,
      insertId: this._pkValue(entityName, docs[0] ?? {}),
      insertedIds: docs.map(doc => this._pkValue(entityName, doc)),
    }
  }

  override async nativeDelete<T extends object>(entityName: string, where: FilterQuery<T>): Promise<QueryResult<T>> {
    const collection = this._collection(entityName)
    const query = new Query(where as any)
    const forRemove = query.find<EntityData<T>[]>(collection).all()
    const collectionWithRemoved = query.remove(collection)
    this.platform.db.set(entityName, collectionWithRemoved)
    return {
      affectedRows: forRemove.length,
      insertId: this._pkValue(entityName, forRemove[0] ?? {}),
      insertedIds: forRemove.map(doc => this._pkValue(entityName, doc)),
    }
  }

  override async count<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: CountOptions<T, P> | undefined
  ): Promise<number> {
    return this._find(entityName, where, options).count()
  }

  private _find<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: FindOptions<T, P> | FindOneOptions<T, P> | CountOptions<T, P> | undefined
  ) {
    const collection = this._collection(entityName)
    const cursor = new Query(this._mikroORMtoMingoQuery(where)).find<EntityData<T>>(collection)
    const limit = (options as FindOptions<T, P>).limit
    const orderBy = (options as FindOptions<T, P>).orderBy
    const offset = (options as FindOptions<T, P>).offset
    if (limit) {
      cursor.limit(limit)
    }
    if ((Array.isArray(orderBy) && orderBy.length) || Object.keys(orderBy ?? {}).length) {
      const sort = [orderBy].flat().reduce(
        (acc, ob) => ({
          ...acc,
          [Object.keys(ob as object)?.[0]!]: (Object.values(ob as object)[0] as string).toLowerCase().startsWith('asc')
            ? 1
            : -1,
        }),
        {}
      )
      cursor.sort(sort)
    }
    if (offset) {
      cursor.skip(offset)
    }
    return cursor
  }

  private _collection(entityName: string) {
    return this.platform.db.get(entityName) ?? this.platform.db.set(entityName, []).get(entityName)!
  }

  private _pkValue<T>(entityName: string, doc: EntityData<T>) {
    return Reflect.get(doc, this.getMetadata().get(entityName).primaryKeys[0] ?? '')
  }

  private _pkWhere<T>(entityName: string, doc: EntityData<T>) {
    const pks = new Set(this.getMetadata().get(entityName).primaryKeys)
    return Object.fromEntries(Object.entries(doc).filter(([key]) => pks.has(key)))
  }

  private _mikroORMtoMingoQuery<T>(query: FilterQuery<T>) {
    return Object.fromEntries(
      Object.entries(query).map(([key, query]) => [
        key,
        query && typeof query === 'object'
          ? omit(
              {
                ...query,
                ...((query as OperatorMap<T>).$like ? { $regex: (query.$like as string).replace(/\%/g, '.*') } : {}),
              },
              '$like'
            )
          : query,
      ])
    )
  }

  private _provideDefaults<T>(entityName: string, data: EntityDictionary<T>) {
    const defaults = this.getMetadata()
      .get<T>(entityName)
      .props.reduce(
        (acc, prop) =>
          prop.defaultRaw?.toLowerCase() === 'current_timestamp' && !data[prop.name]
            ? { ...acc, [prop.name]: new Date() }
            : acc,
        {} as EntityDictionary<T>
      )
    return { ...defaults, ...data }
  }
}
