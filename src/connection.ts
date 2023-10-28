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
}
