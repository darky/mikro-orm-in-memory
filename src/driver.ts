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
import { LokijsPlatform } from './platform'
import { LokijsConnection } from './connection'
import Loki, { LokiMemoryAdapter } from 'lokijs'

export class LokijsDriver extends DatabaseDriver<Connection> {
  protected override readonly connection = new LokijsConnection(this.config)
  protected override readonly platform = new LokijsPlatform()

  private db = new Loki('db', { adapter: new LokiMemoryAdapter() })

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
    const doc = collection.insert(data)
    return {
      affectedRows: 1,
      insertId: this._pkValue(entityName, doc),
    }
  }

  override nativeInsertMany<T extends object>(
    entityName: string,
    data: EntityDictionary<T>[],
    options?: NativeInsertUpdateManyOptions<T> | undefined
  ): Promise<QueryResult<T>> {
    return null as any
  }

  override nativeUpdate<T extends object>(
    entityName: string,
    where: FilterQuery<T>,
    data: EntityDictionary<T>,
    options?: NativeInsertUpdateOptions<T> | undefined
  ): Promise<QueryResult<T>> {
    return null as any
  }

  override async nativeDelete<T extends object>(
    entityName: string,
    where: FilterQuery<T>,
    options?: DeleteOptions<T> | undefined
  ): Promise<QueryResult<T>> {
    const collection = this._collection(entityName)
    const docs = await this._find(entityName, where)
    docs.forEach(doc => collection.remove(doc))
    return {
      affectedRows: docs.length,
      insertId: this._pkValue(entityName, docs[0] ?? {}),
      insertedIds: docs.map(doc => this._pkValue(entityName, doc)),
    }
  }

  override async count<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: CountOptions<T, P> | undefined
  ): Promise<number> {
    return 0
  }

  private async _find<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: FindOneOptions<T, P> | undefined
  ): Promise<EntityData<T>[]> {
    const collection = this._collection(entityName)
    return collection
      .chain()
      .find(where as any)
      .limit(1)
      .data()
  }

  private _collection(entityName: string) {
    return this.db.getCollection(entityName) ?? this.db.addCollection(entityName)
  }

  private _pkValue<T>(entityName: string, doc: EntityData<T>) {
    return Reflect.get(doc, this.getMetadata().get(entityName).primaryKeys[0] ?? '')
  }
}
