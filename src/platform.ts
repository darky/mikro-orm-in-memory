import { Connection, EntityManager, IDatabaseDriver, Platform } from '@mikro-orm/core'
import { ISchemaGenerator } from '@mikro-orm/core/typings'

export class InMemoryPlatform extends Platform {
  override getSchemaGenerator(
    driver: IDatabaseDriver<Connection>,
    em?: EntityManager<IDatabaseDriver<Connection>> | undefined
  ): ISchemaGenerator {
    return {
      async ensureDatabase() {
        return true
      },
    }
  }
}
