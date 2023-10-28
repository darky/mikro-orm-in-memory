import { Connection, EntityManager, IDatabaseDriver, Platform } from '@mikro-orm/core'
import { EntityData, ISchemaGenerator } from '@mikro-orm/core/typings'

export class InMemoryPlatform extends Platform {
  db = new Map<string, EntityData<unknown>[]>()

  override getSchemaGenerator(
    driver: IDatabaseDriver<Connection>,
    em?: EntityManager<IDatabaseDriver<Connection>> | undefined
  ): ISchemaGenerator {
    return {
      async ensureDatabase() {
        return true
      },
      async dropSchema() {},
      async createSchema() {},
      async updateSchema() {},
      async refreshDatabase() {},
      clearDatabase: async () => {
        this.db.clear()
      },
    }
  }
}
