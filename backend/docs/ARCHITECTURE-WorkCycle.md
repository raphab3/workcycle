# 🏗️ Architecture Design System
> Stack: NestJS + Fastify + Drizzle + PostgreSQL + Redis + BullMQ  
> Estilo: Modular Monolito | Organização: Por Feature

---

## 📁 Estrutura de Pastas

```
src/
│
├── @types/                              # Declarações de tipos globais e augmentations
│   └── fastify.d.ts
│
├── config/                              # Configurações centralizadas
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── index.ts
│
├── database/                            # Camada Drizzle
│   ├── migrations/
│   ├── schema/
│   │   ├── users.schema.ts
│   │   ├── orders.schema.ts
│   │   └── index.ts
│   ├── drizzle.module.ts
│   ├── drizzle.service.ts
│   └── drizzle.config.ts
│
├── shared/                              # Tudo compartilhado entre módulos
│   │
│   ├── providers/                       # Providers de infraestrutura reutilizáveis
│   │   ├── storage/                     # Upload / Storage (S3, local, etc.)
│   │   │   ├── storage.module.ts
│   │   │   ├── storage.service.ts
│   │   │   └── storage.interface.ts
│   │   │
│   │   ├── cache/                       # Wrapper Redis para cache
│   │   │   ├── cache.module.ts
│   │   │   ├── cache.service.ts
│   │   │   └── cache.constants.ts
│   │   │
│   │   ├── queues/                      # Configuração e registro das filas BullMQ
│   │   │   ├── queues.module.ts         # Registra todas as filas globalmente
│   │   │   └── queues.constants.ts      # Nomes das filas (sem strings mágicas)
│   │   │
│   │   └── jobs/                        # Jobs genéricos / reutilizáveis entre features
│   │       └── send-email.job.ts
│   │
│   ├── decorators/                      # Decorators customizados (@CurrentUser, @Public)
│   ├── filters/                         # Exception filters globais
│   ├── guards/                          # Guards globais (AuthGuard, RolesGuard)
│   ├── interceptors/                    # Interceptors globais (logging, transform)
│   ├── middlewares/                     # Middlewares HTTP globais
│   ├── pipes/                           # Pipes globais de validação/transformação
│   └── utils/                           # Funções utilitárias puras (sem deps NestJS)
│
├── modules/                             # Módulos da aplicação (por feature)
│   │
│   ├── users/
│   │   ├── controllers/
│   │   │   ├── users.controller.ts
│   │   │   └── users.controller.spec.ts
│   │   │
│   │   ├── services/                    # Um arquivo por responsabilidade
│   │   │   ├── users-finder.service.ts          # Queries / leitura
│   │   │   ├── users-finder.service.spec.ts
│   │   │   ├── users-writer.service.ts          # Mutations / escrita
│   │   │   └── users-writer.service.spec.ts
│   │   │
│   │   ├── use-cases/                   # Lógica reutilizável entre services/módulos
│   │   │   ├── find-user-by-email.use-case.ts
│   │   │   ├── find-user-by-email.use-case.spec.ts
│   │   │   ├── validate-user-password.use-case.ts
│   │   │   └── validate-user-password.use-case.spec.ts
│   │   │
│   │   ├── repositories/
│   │   │   └── users.repository.ts
│   │   │
│   │   ├── dtos/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── user-response.dto.ts
│   │   │
│   │   ├── types/                       # Tipos e interfaces específicos do módulo
│   │   │   ├── user.types.ts
│   │   │   └── user.enums.ts
│   │   │
│   │   └── users.module.ts
│   │
│   ├── orders/
│   │   ├── controllers/
│   │   │   ├── orders.controller.ts
│   │   │   └── orders.controller.spec.ts
│   │   │
│   │   ├── services/
│   │   │   ├── orders-finder.service.ts
│   │   │   ├── orders-finder.service.spec.ts
│   │   │   ├── orders-writer.service.ts
│   │   │   └── orders-writer.service.spec.ts
│   │   │
│   │   ├── use-cases/
│   │   │   ├── calculate-order-total.use-case.ts
│   │   │   └── calculate-order-total.use-case.spec.ts
│   │   │
│   │   ├── jobs/                        # Jobs específicos desta feature
│   │   │   ├── process-order.job.ts
│   │   │   └── process-order.job.spec.ts
│   │   │
│   │   ├── repositories/
│   │   │   └── orders.repository.ts
│   │   │
│   │   ├── dtos/
│   │   ├── types/
│   │   └── orders.module.ts
│   │
│   └── auth/
│       ├── controllers/
│       ├── services/
│       ├── use-cases/
│       ├── strategies/                  # Passport strategies (JWT, Local)
│       ├── dtos/
│       ├── types/
│       └── auth.module.ts
│
├── app.module.ts
├── app.controller.ts
└── main.ts
│
test/                                    # Testes e2e — fora do src/
├── users.e2e-spec.ts
├── orders.e2e-spec.ts
└── jest-e2e.json
```

---

## 📐 Convenções de Nomenclatura

### Arquivos
| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Controller | `[entidade].controller.ts` | `users.controller.ts` |
| Service (leitura) | `[entidade]-finder.service.ts` | `users-finder.service.ts` |
| Service (escrita) | `[entidade]-writer.service.ts` | `users-writer.service.ts` |
| Use Case | `[verbo]-[entidade].use-case.ts` | `find-user-by-email.use-case.ts` |
| Repository | `[entidade].repository.ts` | `users.repository.ts` |
| DTO | `[acao]-[entidade].dto.ts` | `create-user.dto.ts` |
| Types | `[entidade].types.ts` | `user.types.ts` |
| Enums | `[entidade].enums.ts` | `user.enums.ts` |
| Schema Drizzle | `[entidade].schema.ts` | `users.schema.ts` |
| Job | `[acao]-[entidade].job.ts` | `process-order.job.ts` |
| Teste unitário | `[arquivo].spec.ts` | `users-finder.service.spec.ts` |
| Teste e2e | `[recurso].e2e-spec.ts` | `users.e2e-spec.ts` |
| Guard | `[nome].guard.ts` | `auth.guard.ts` |
| Decorator | `[nome].decorator.ts` | `current-user.decorator.ts` |
| Interceptor | `[nome].interceptor.ts` | `logging.interceptor.ts` |
| Filter | `[nome].filter.ts` | `http-exception.filter.ts` |
| Config | `[contexto].config.ts` | `database.config.ts` |
| Constants | `[contexto].constants.ts` | `users.constants.ts` |

### Classes e Variáveis
| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Classes | PascalCase | `UsersFinderService` |
| Interfaces | PascalCase com `I` prefix | `IUserRepository` |
| Enums | PascalCase | `UserRole` |
| Constantes | SCREAMING_SNAKE_CASE | `QUEUE_NAMES` |
| Variáveis/funções | camelCase | `findUserById` |
| Token de injeção | SCREAMING_SNAKE_CASE | `DRIZZLE_TOKEN` |

---

## 🧩 Padrões de Código

---

### Schema Drizzle (`database/schema/users.schema.ts`)

```typescript
import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'customer', 'guest']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').default('customer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sempre use tipos inferidos — nunca crie interfaces manuais para entidades do banco
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

---

### Types do módulo (`modules/users/types/user.types.ts`)

```typescript
export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
}
```

```typescript
// types/user.enums.ts
export enum UserRole {
  Admin = 'admin',
  Customer = 'customer',
  Guest = 'guest',
}
```

---

### DTO (`modules/users/dtos/create-user.dto.ts`)

```typescript
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../types/user.enums';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.Customer })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
```

```typescript
// dtos/user-response.dto.ts
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() email: string;
  @Expose() role: string;
  @Expose() createdAt: Date;
  // passwordHash sem @Expose() — nunca serializado
}
```

---

### Repository (`modules/users/repositories/users.repository.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { users, User, NewUser } from '@/database/schema/users.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: DrizzleService) {}

  async findAll(): Promise<User[]> {
    return this.db.client.select().from(users);
  }

  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.db.client
      .select().from(users).where(eq(users.id, id));
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.client
      .select().from(users).where(eq(users.email, email));
    return user;
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await this.db.client
      .insert(users).values(data).returning();
    return user;
  }

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const [user] = await this.db.client
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.db.client.delete(users).where(eq(users.id, id));
  }
}
```

---

### Use Case (`modules/users/use-cases/find-user-by-email.use-case.ts`)

> Use cases encapsulam lógica reutilizável entre services ou módulos diferentes.  
> Sempre têm um único método público: `execute()`.

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { User } from '@/database/schema/users.schema';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new NotFoundException(`Usuário com email ${email} não encontrado`);
    return user;
  }
}
```

```typescript
// find-user-by-email.use-case.spec.ts
import { Test } from '@nestjs/testing';
import { FindUserByEmailUseCase } from './find-user-by-email.use-case';
import { UsersRepository } from '../repositories/users.repository';
import { NotFoundException } from '@nestjs/common';

const mockUsersRepository = { findByEmail: jest.fn() };

describe('FindUserByEmailUseCase', () => {
  let useCase: FindUserByEmailUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FindUserByEmailUseCase,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    useCase = module.get(FindUserByEmailUseCase);
    jest.clearAllMocks();
  });

  it('deve retornar o usuário quando o email existe', async () => {
    const fakeUser = { id: '1', email: 'joao@email.com', name: 'João' };
    mockUsersRepository.findByEmail.mockResolvedValue(fakeUser);

    const result = await useCase.execute('joao@email.com');

    expect(result).toEqual(fakeUser);
    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith('joao@email.com');
  });

  it('deve lançar NotFoundException quando email não existe', async () => {
    mockUsersRepository.findByEmail.mockResolvedValue(undefined);

    await expect(useCase.execute('naoexiste@email.com'))
      .rejects.toThrow(NotFoundException);
  });
});
```

---

### Service — leitura (`modules/users/services/users-finder.service.ts`)

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { FindUserByEmailUseCase } from '../use-cases/find-user-by-email.use-case';
import { User } from '@/database/schema/users.schema';

@Injectable()
export class UsersFinderService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly findUserByEmail: FindUserByEmailUseCase,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`Usuário ${id} não encontrado`);
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.findUserByEmail.execute(email);
  }
}
```

```typescript
// users-finder.service.spec.ts
import { Test } from '@nestjs/testing';
import { UsersFinderService } from './users-finder.service';
import { UsersRepository } from '../repositories/users.repository';
import { FindUserByEmailUseCase } from '../use-cases/find-user-by-email.use-case';
import { NotFoundException } from '@nestjs/common';

const mockRepo = { findAll: jest.fn(), findById: jest.fn() };
const mockFindByEmail = { execute: jest.fn() };

describe('UsersFinderService', () => {
  let service: UsersFinderService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersFinderService,
        { provide: UsersRepository, useValue: mockRepo },
        { provide: FindUserByEmailUseCase, useValue: mockFindByEmail },
      ],
    }).compile();

    service = module.get(UsersFinderService);
    jest.clearAllMocks();
  });

  it('deve retornar lista de usuários', async () => {
    mockRepo.findAll.mockResolvedValue([{ id: '1' }]);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('deve lançar NotFoundException para id inexistente', async () => {
    mockRepo.findById.mockResolvedValue(undefined);
    await expect(service.findById('uuid-invalido')).rejects.toThrow(NotFoundException);
  });
});
```

---

### Service — escrita (`modules/users/services/users-writer.service.ts`)

```typescript
import { Injectable, ConflictException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '@/database/schema/users.schema';

@Injectable()
export class UsersWriterService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.usersRepository.findByEmail(dto.email);
    if (exists) throw new ConflictException('E-mail já cadastrado');
    return this.usersRepository.create(dto);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return this.usersRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

```typescript
// users-writer.service.spec.ts
describe('UsersWriterService', () => {
  it('deve criar usuário com sucesso', async () => { /* ... */ });
  it('deve lançar ConflictException se email já existir', async () => { /* ... */ });
  it('deve atualizar usuário', async () => { /* ... */ });
  it('deve remover usuário', async () => { /* ... */ });
});
```

---

### Controller (`modules/users/controllers/users.controller.ts`)

```typescript
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersFinderService } from '../services/users-finder.service';
import { UsersWriterService } from '../services/users-writer.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly finder: UsersFinderService,
    private readonly writer: UsersWriterService,
  ) {}

  @Get()
  findAll() { return this.finder.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.finder.findById(id); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto) { return this.writer.create(dto); }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.writer.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.writer.remove(id); }
}
```

---

### Job BullMQ (`modules/orders/jobs/process-order.job.ts`)

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '@/shared/providers/queues/queues.constants';

@Processor(QUEUE_NAMES.ORDERS)
export class ProcessOrderJob extends WorkerHost {
  private readonly logger = new Logger(ProcessOrderJob.name);

  async process(job: Job<{ orderId: string }>): Promise<void> {
    this.logger.log(`Processando pedido ${job.data.orderId}`);
    // lógica de processamento
  }
}
```

```typescript
// process-order.job.spec.ts
describe('ProcessOrderJob', () => {
  it('deve processar o job com orderId correto', async () => { /* ... */ });
  it('deve lançar erro se orderId estiver ausente', async () => { /* ... */ });
});
```

---

### Module (`modules/users/users.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersFinderService } from './services/users-finder.service';
import { UsersWriterService } from './services/users-writer.service';
import { UsersRepository } from './repositories/users.repository';
import { FindUserByEmailUseCase } from './use-cases/find-user-by-email.use-case';

@Module({
  controllers: [UsersController],
  providers: [
    UsersFinderService,
    UsersWriterService,
    UsersRepository,
    FindUserByEmailUseCase,
  ],
  exports: [UsersFinderService, FindUserByEmailUseCase], // exporte o mínimo necessário
})
export class UsersModule {}
```

---

### Cache Provider (`shared/providers/cache/cache.service.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    ttlSeconds
      ? await this.redis.setex(key, ttlSeconds, serialized)
      : await this.redis.set(key, serialized);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

---

### Queue Constants (`shared/providers/queues/queues.constants.ts`)

```typescript
// Nunca use strings de fila diretamente no código — sempre importe daqui
export const QUEUE_NAMES = {
  ORDERS: 'orders',
  EMAILS: 'emails',
  NOTIFICATIONS: 'notifications',
} as const;
```

---

## 🧪 Regras de Testes

### Unitários — Obrigatório
- **Todo `service` e `use-case` DEVE ter um `*.spec.ts` criado junto**, no mesmo momento
- Arquivo de teste sempre ao lado do arquivo testado (mesma pasta)
- Nunca use banco real — sempre mock do repository via `jest.fn()`
- Casos mínimos por arquivo:
  - ✅ Caminho feliz (retorno esperado)
  - ❌ Erro esperado (`NotFoundException`, `ConflictException`, etc.)
  - ⚠️ Edge cases relevantes ao domínio

### Integração / E2E — Perguntar antes de criar
- **Antes de criar testes e2e, sempre perguntar ao usuário:** _"Deseja que eu crie também o teste de integração para este recurso?"_
- Testes e2e vivem em `test/` na raiz (fora do `src/`)
- Usam banco e Redis reais via Docker Compose de teste
- Nomenclatura: `[recurso].e2e-spec.ts`

---

## 🔑 Regras Gerais

1. **Controllers** — apenas rotas e injeção. Sem lógica de negócio
2. **Services** — regras de negócio. Um arquivo por responsabilidade (finder / writer). Não deixar crescer — crie um novo service se necessário
3. **Use Cases** — lógica reutilizável entre services ou módulos. Método único: `execute()`. Sempre com teste
4. **Repositories** — única camada que acessa o banco. Sem regras de negócio
5. **DTOs** — entrada com `class-validator`. Saída com `@Expose()`
6. **Schemas Drizzle** — ficam em `database/schema/`. Nunca dentro dos módulos
7. **Types/Enums** — tipos específicos do módulo em `types/`. Tipos de infra em `shared/`
8. **Providers de infra** — cache, storage, queues sempre em `shared/providers/`
9. **Jobs de feature** — `jobs/` dentro do módulo. Jobs genéricos em `shared/providers/jobs/`
10. **Nunca use `any`** — sempre tipar ou usar inferência do Drizzle (`$inferSelect`)
11. **Erros** — sempre com exceptions do NestJS (`NotFoundException`, `ConflictException`, etc.)
12. **Constantes** — sempre em `*.constants.ts`. Nunca strings mágicas inline
13. **Imports absolutos** — sempre com alias `@/` ao invés de `../../..`
14. **Testes unitários** — obrigatórios para todo service e use-case, criados junto com o arquivo
15. **Testes de integração** — sempre perguntar ao usuário antes de criar
