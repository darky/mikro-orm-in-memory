import { Entity, MikroORM, PrimaryKey, Property } from '@mikro-orm/core'
import test, { afterEach, beforeEach } from 'node:test'
import { LokijsDriver } from '../src/driver'
import assert from 'assert'

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

test('insert one', async () => {
  const id = await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  assert.strictEqual(id, 1)
})
