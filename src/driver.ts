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

export class LokijsDriver extends DatabaseDriver<Connection> {
  protected override readonly connection = new LokijsConnection(this.config)
  protected override readonly platform = new LokijsPlatform()

  override async findOne<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: FindOneOptions<T, P> | undefined
  ): Promise<EntityData<T> | null> {
    return null
  }

  override async find<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: FindOptions<T, P> | undefined
  ): Promise<EntityData<T>[]> {
    return []
  }

  override async nativeInsert<T extends object>(
    entityName: string,
    data: EntityDictionary<T>,
    options?: NativeInsertUpdateOptions<T> | undefined
  ): Promise<QueryResult<T>> {
    return null as any
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
    return null as any
  }

  override async count<T extends object, P extends string = never>(
    entityName: string,
    where: FilterQuery<T>,
    options?: CountOptions<T, P> | undefined
  ): Promise<number> {
    return 0
  }
}
