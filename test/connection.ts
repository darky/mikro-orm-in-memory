import { Entity, MikroORM, PrimaryKey, Property } from '@mikro-orm/core'
import test, { afterEach, beforeEach } from 'node:test'
import { LokijsDriver } from '../src/driver'

let orm: MikroORM

@Entity()
class TestEntity {
  @PrimaryKey()
  id!: number

  @Property()
  value!: string
}

beforeEach(async () => {
  orm = await MikroORM.init({ dbName: 'test', driver: LokijsDriver, entities: [TestEntity] })
})

afterEach(async () => {
  await orm.close()
})

test('stub', () => {})
