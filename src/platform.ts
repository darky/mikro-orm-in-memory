import { Platform } from '@mikro-orm/core'
import { EntityData, ISchemaGenerator } from '@mikro-orm/core/typings'

export class InMemoryPlatform extends Platform {
  db = new Map<string, EntityData<unknown>[]>()

  override getSchemaGenerator(): ISchemaGenerator {
    return {
      async ensureDatabase() {
        return true
      },
      async dropSchema() {},
      async createSchema() {},
      async updateSchema() {},
      async createDatabase() {},
      async dropDatabase() {},
      async refreshDatabase() {},
      clearDatabase: async () => {
        this.db.clear()
      },
      async generate() {
        return ''
      },
      async getCreateSchemaSQL() {
        return ''
      },
      async getDropSchemaSQL() {
        return ''
      },
      async getUpdateSchemaSQL() {
        return ''
      },
      async getUpdateSchemaMigrationSQL() {
        return { up: '', down: '' }
      },
      async ensureIndexes() {},
      async execute() {},
    }
  }
}
