# mikro-orm-in-memory

MikroORM in memory for unit tests

## Go

```typescript
import { InMemoryDriver } from 'mikro-orm-in-memory'

await MikroORM.init({ dbName: 'test', driver: InMemoryDriver, /* ... */ })
```
