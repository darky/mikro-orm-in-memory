import {
  Connection,
  CountOptions,
  DatabaseDriver,
  DeleteOptions,
  EntityData,
  EntityDictionary,
  FilterQuery,
  FindOneOptions,
  FindOptions,
  NativeInsertUpdateManyOptions,
  NativeInsertUpdateOptions,
  QueryResult,
} from '@mikro-orm/core'
import { InMemoryPlatform } from './platform'
import { InMemoryConnection } from './connection'
import { Query } from 'mingo'
import { OperatorMap } from '@mikro-orm/core/typings'
import omit from 'lodash.omit'
import { isObject } from 'util'

export class InMemoryDriver extends DatabaseDriver<Connection> {
  protected override readonly connection = new InMemoryConnection(this.config)
  protected override readonly platform = new InMemoryPlatform()

  override async findOne<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: FindOneOptions<T, P> | undefined
  ): Promise<EntityData<T> | null> {
    return (await this._find(entityName, where, options))[0] ?? null
  }

  override async find<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: FindOptions<T, P> | undefined
  ): Promise<EntityData<T>[]> {
    return await this._find(entityName, where, options)
  }

  override async nativeInsert<T extends object>(
    entityName: string,
    data: EntityDictionary<T>,
    options?: NativeInsertUpdateOptions<T> | undefined
  ): Promise<QueryResult<T>> {
    const collection = this._collection(entityName)
    const exists = new Query(this._pkWhere(entityName, data)).find(collection).all()
    if (exists.length) {
      throw new Error('exists')
    }
    collection.push(data)
    return {
      affectedRows: 1,
      insertId: this._pkValue(entityName, data),
    }
  }

  override nativeInsertMany<T extends object>(
    entityName: string,
    data: EntityDictionary<T>[],
    options?: NativeInsertUpdateManyOptions<T> | undefined
  ): Promise<QueryResult<T>> {
    return null as any
  }

  override async nativeUpdate<T extends object>(
    entityName: string,
    where: FilterQuery<T>,
    data: EntityDictionary<T>,
    options?: NativeInsertUpdateOptions<T> | undefined
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

  override async nativeDelete<T extends object>(
    entityName: string,
    where: FilterQuery<T>,
    options?: DeleteOptions<T> | undefined
  ): Promise<QueryResult<T>> {
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
    const collection = this._collection(entityName)
    return new Query(where as any).find<EntityData<T>>(collection).count()
  }

  private async _find<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: FindOneOptions<T, P> | undefined
  ): Promise<EntityData<T>[]> {
    const collection = this._collection(entityName)
    return new Query(this._mikroORMtoMingoQuery(where)).find<EntityData<T>>(collection).all()
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
}
