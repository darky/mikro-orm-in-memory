import { Connection } from '@mikro-orm/core'

export class InMemoryConnection extends Connection {
  override async connect(): Promise<void> {}
  override async isConnected(): Promise<boolean> {
    return true
  }
  protected override client: unknown
  override getDefaultClientUrl(): string {
    return 'http://test'
  }
  override async execute(): Promise<any> {}
  override transactional<T>(cb: (trx: any) => Promise<T>) {
    return cb(null)
  }
  override async begin() {}
  override async commit() {}
  override async rollback() {}
}
