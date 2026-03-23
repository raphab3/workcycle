# [T008] Persistir Settings e contratos de preferências

> **Tipo:** API | **Tamanho:** M (3pts) | **Fluxo:** CF-06  
> **Depende de:** T001 | **Bloqueia:** T009, T010  
> **Assignee:** Copilot | **Status:** Concluido

## Contexto
Settings é dependência transversal para Today e Weekly por causa de timezone e boundary operacional. O backend precisa persistir preferências do usuário e expor contratos claros para leitura e atualização.

## O que fazer
Implementar persistência e contratos de Settings no backend, cobrindo timezone, notifications enabled, daily review time, cycle start hour e vínculo Google.

### Arquivos esperados / impactados
- `backend/src/shared/database/schema/` — criar ou modificar schema de preferências
- `backend/src/shared/database/migrations/*` — criar se necessário
- `backend/src/modules/auth/` ou novo módulo de settings — modificar
- `backend/src/modules/accounts/` — modificar se o vínculo Google permanecer aqui

## Critérios de Aceite

- [x] Existe contrato de leitura de preferências do usuário autenticado
- [x] Existe contrato de atualização parcial de preferências
- [x] Timezone, notifications enabled, daily review time e cycle start hour ficam persistidos
- [x] O vínculo Google pode ser consultado com segurança no contexto de settings
- [x] Testes de leitura e atualização foram adicionados
- [x] Sem regressão nos testes existentes no escopo validado de Settings

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface UserSettingsDTO {
  timezone: string;
  notificationsEnabled: boolean;
  dailyReviewTime: string;
  cycleStartHour: string;
}
```

### Regras de Negócio
- Settings deve ser resolvido por usuário autenticado.
- Timezone não pode ser tratado como mera preferência visual; ele impacta lógica operacional.

### Edge Cases
- [x] Timezone inválido
- [x] Atualização parcial omitindo todos os campos
- [x] Conta sem vínculo Google consultando settings

## Notas de Implementação
Se a decisão sobre desvinculação de Google continuar em aberto, limitar este ticket à leitura segura e ao contrato base.

## Implementação Realizada

- Criado o módulo `Settings` no backend com `GET /settings` e `PATCH /settings`, ambos resolvidos por usuário autenticado.
- Adicionada a tabela `user_settings` com persistência para `timezone`, `notificationsEnabled`, `dailyReviewTime` e `cycleStartHour`.
- Gerada a migration `backend/src/shared/database/migrations/0004_broad_silverclaw.sql` para materializar a nova tabela.
- O contrato público passou a expor também `googleConnection`, com `hasGoogleLinked`, `linkedAt` e `connectedAccountCount`, permitindo consulta segura do vínculo Google no contexto de Settings sem depender do payload detalhado de Accounts.
- A leitura cria o registro default do usuário sob demanda quando ele ainda não existe, evitando payload vazio para T009 e T010.
- A atualização é parcial e validada por schema, com rejeição explícita para payload vazio, timezone inválido e horários fora do formato `HH:mm`.

## Contrato Entregue

```typescript
interface UserSettingsDTO {
  timezone: string;
  notificationsEnabled: boolean;
  dailyReviewTime: string;
  cycleStartHour: string;
  googleConnection: {
    hasGoogleLinked: boolean;
    linkedAt: string | null;
    connectedAccountCount: number;
  };
}
```

Defaults persistidos na primeira leitura:

- `timezone: 'UTC'`
- `notificationsEnabled: false`
- `dailyReviewTime: '18:00'`
- `cycleStartHour: '00:00'`

## Validação

- `pnpm exec tsx --test src/shared/database/schema/settings.schema.spec.ts src/modules/settings/settings.schemas.spec.ts src/modules/settings/types/settings.spec.ts src/modules/settings/services/settings-finder.service.spec.ts src/modules/settings/services/settings-writer.service.spec.ts`
- `pnpm exec eslint src/modules/settings src/shared/database/schema/settings.schema.ts src/shared/database/schema/settings.schema.spec.ts src/app.module.ts src/shared/database/schema/index.ts`
- `pnpm db:generate`

## Observações

- O build completo do backend continua falhando por erros pré-existentes no módulo `events` relacionados a `exactOptionalPropertyTypes`. T008 não introduziu esses erros; o escopo novo de Settings ficou validado isoladamente.

## Checkpoint

- T008 concluído com persistência de Settings e contrato backend prontos para T009 e T010.
- Próximo passo natural: T009 consumir `GET /settings` e `PATCH /settings` no frontend de configurações.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
