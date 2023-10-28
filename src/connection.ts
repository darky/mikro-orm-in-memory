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
  override async execute<T>(
    query: string,
    params?: any[] | undefined,
    method?: 'all' | 'get' | 'run' | undefined,
    ctx?: any
  ): Promise<any> {}
}
