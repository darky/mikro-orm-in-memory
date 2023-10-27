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

test('basic insert one', async () => {
  const id = await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  assert.strictEqual(id, 1)
})

test('basic find one', async () => {
  await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  const doc = await orm.em.fork().findOne(TestEntity, { id: 1 })
  assert.strictEqual(doc?.id, 1)
  assert.strictEqual(doc.value, 'test')
})

test('basic find', async () => {
  await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  const docs = await orm.em.fork().find(TestEntity, {})
  assert.strictEqual(docs.length, 1)
  assert.strictEqual(docs[0]?.id, 1)
  assert.strictEqual(docs[0]?.value, 'test')
})

test('physical removing', async () => {
  await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  const id = await orm.em.fork().nativeDelete(TestEntity, { id: 1 })
  assert.strictEqual(id, 1)
  const docs = await orm.em.fork().find(TestEntity, {})
  assert.strictEqual(docs.length, 0)
})
