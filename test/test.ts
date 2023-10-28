import { Entity, MikroORM, PrimaryKey, Property } from '@mikro-orm/core'
import test, { afterEach, beforeEach } from 'node:test'
import { InMemoryDriver } from '../src/driver'
import assert from 'assert'
import { isDate } from 'util/types'

let orm: MikroORM

@Entity()
class TestEntity {
  @PrimaryKey()
  id!: number

  @Property()
  value!: string

  @Property({ defaultRaw: 'current_timestamp' })
  createdAt!: Date
}

beforeEach(async () => {
  orm = await MikroORM.init({ dbName: 'test', driver: InMemoryDriver, entities: [TestEntity] })

  await orm.getSchemaGenerator().clearDatabase()
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

test('basic count', async () => {
  await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  const count = await orm.em.fork().count(TestEntity, { id: 1 })
  assert.strictEqual(count, 1)
})

test('basic update', async () => {
  await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  const id = await orm.em.fork().nativeUpdate(TestEntity, { id: 1 }, { value: 'update-test' })
  assert.strictEqual(id, 1)
  const doc = await orm.em.fork().findOne(TestEntity, { id: 1 })
  assert.strictEqual(doc?.value, 'update-test')
})

test('$in query', async () => {
  await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  const docs = await orm.em.fork().find(TestEntity, { id: { $in: [1] } })
  assert.strictEqual(docs.length, 1)
  assert.strictEqual(docs[0]?.value, 'test')
})

test('$like query', async () => {
  await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  const docs = await orm.em.fork().find(TestEntity, { value: { $like: 'tes%' } })
  assert.strictEqual(docs.length, 1)
  assert.strictEqual(docs[0]?.value, 'test')
})

test('current_timestamp', async () => {
  await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  const doc = await orm.em.fork().findOne(TestEntity, { id: 1 })
  assert.strictEqual(isDate(doc?.createdAt), true)
})

test('limit', async () => {
  await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  await orm.em.fork().insert(TestEntity, {
    id: 2,
    value: 'test 2',
  })
  const docs = await orm.em.fork().find(TestEntity, {}, { limit: 1 })
  assert.strictEqual(docs.length, 1)
  assert.strictEqual(docs[0]?.id, 1)
})

test('orderBy desc', async () => {
  await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  await orm.em.fork().insert(TestEntity, {
    id: 2,
    value: 'test 2',
  })
  const docs = await orm.em.fork().find(TestEntity, {}, { orderBy: { id: 'DESC' } })
  assert.strictEqual(docs[0]?.id, 2)
})

test('orderBy asc', async () => {
  await orm.em.fork().insert(TestEntity, {
    id: 1,
    value: 'test',
  })
  await orm.em.fork().insert(TestEntity, {
    id: 2,
    value: 'test 2',
  })
  const docs = await orm.em.fork().find(TestEntity, {}, { orderBy: { id: 'ASC' } })
  assert.strictEqual(docs[0]?.id, 1)
})
