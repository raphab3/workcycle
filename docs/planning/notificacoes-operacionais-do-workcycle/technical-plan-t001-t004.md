# Planejamento Tecnico — Bloco 1 (T001-T004)

> **Epic:** [epic.md](./epic.md) | **Core Flow:** [core-flow.md](./core-flow.md) | **Tickets:** [tickets/INDEX.md](./tickets/INDEX.md)
> **Recorte:** T001, T002, T003, T004
> **Data:** 2026-03-22

## Objetivo do bloco

Fechar a base tecnica de notificacoes operacionais sem implementar ainda os fluxos especificos de pulso, revisao diaria, recovery ou historico persistido. Ao final do bloco, o produto deve ter:

- contrato backend de Settings endurecido e explicitamente limitado a preferencias persistidas
- camada frontend canonica de Settings operacionais fora do modulo de auth
- leitura consolidada de capacidade real do navegador
- motor inicial de entrega e deduplicacao em memoria para eventos operacionais

## Estado atual confirmado no codigo

### Backend

- `GET /settings` e `PATCH /settings` ja existem em `backend/src/modules/settings/controllers/settings.controller.ts`.
- O schema atual ja valida `timezone`, `dailyReviewTime`, `cycleStartHour` e `notificationsEnabled` em `backend/src/modules/settings/settings.schemas.ts`.
- O DTO publico atual ja esta concentrado em `backend/src/modules/settings/types/settings.ts`.

### Frontend

- Ja existe um service de settings em `frontend/src/modules/auth/services/settingsService.ts`.
- Ja existem query hook e mutation em `frontend/src/modules/auth/queries/useUserSettingsQuery.ts` e `frontend/src/modules/auth/queries/useUpdateUserSettingsMutation.ts`.
- `SettingsHydrator` em `frontend/src/providers/index.tsx` aplica settings no `useWorkspaceStore`.
- A rota `frontend/src/app/(pages)/configuracoes/page.tsx` ainda renderiza apenas `AuthSettingsWorkspace`.
- `frontend/src/modules/today/hooks/useActivityPulse.ts` ainda funciona com timers locais e nao possui fronteira explicita com Notifications.

## Decisoes de arquitetura do bloco

### 1. Fronteira de Settings

- Backend continua dono apenas de preferencias persistidas.
- Frontend move a camada operacional de Settings de `modules/auth` para `modules/settings`.
- `AuthSettingsWorkspace` nao deixa de existir neste bloco; a extracao e incremental para evitar refactor estrutural amplo junto com Notifications.

### 2. Fronteira de Notifications

- `modules/notifications` nasce como dominio proprio no frontend.
- O modulo sera dono de:
  - capability do navegador
  - decisao de canal
  - deduplicacao em memoria
  - estado degradado explicavel
- O modulo nao sera dono neste bloco de:
  - historico persistido
  - multiaba
  - recovery na retomada
  - agendamento de revisao diaria

### 3. Fronteira de Today

- Today continua dono de sessao, pulse timing e expiracao.
- Neste bloco, Today ainda nao emite eventos para Notifications; isso comeca em T005.
- O unico acoplamento permitido desde ja e o desenho dos tipos de evento para consumo futuro.

## Ordem real de execucao do bloco

1. T001
2. T002
3. T003
4. T004

### Justificativa

- T001 fecha a fronteira contratual antes de qualquer consumo adicional.
- T002 extrai a camada de Settings do frontend para o dominio correto e preserva a hidratacao global.
- T003 publica o estado client-side de capability sem depender ainda dos fluxos de Today.
- T004 usa as duas bases anteriores para criar o nucleo de Notifications.

## Plano por ticket

### T001 — Reforcar contrato de Settings para notificacoes operacionais

**Objetivo tecnico**
Blindar o contrato de Settings para que browser permission, foco, visibilidade e suporte nao entrem nem no DTO publico nem no input persistido.

**Arquivos alvo**
- `backend/src/modules/settings/types/settings.ts`
- `backend/src/modules/settings/settings.schemas.ts`
- `backend/src/modules/settings/controllers/settings.controller.ts`
- `backend/src/modules/settings/settings.schemas.spec.ts`
- `backend/src/modules/settings/types/settings.spec.ts`

**Mudancas planejadas**
- Tornar o schema de update estrito contra chaves extras.
- Consolidar `UpdateUserSettingsInput` junto do contrato publico em `types/settings.ts` se isso simplificar imports.
- Garantir por teste que o DTO publico continua contendo apenas:
  - `cycleStartHour`
  - `dailyReviewTime`
  - `notificationsEnabled`
  - `timezone`
  - `googleConnection`

**Risco controlado**
- Cliente antigo mandando campo extra no `PATCH` passa a falhar. O risco atual e baixo porque o frontend ja usa payload enxuto.

### T002 — Integrar preferencias operacionais no frontend

**Objetivo tecnico**
Extrair a camada de settings operacionais de `modules/auth` para `modules/settings`, mantendo a hidratacao global sem reescrever a pagina de configuracoes neste bloco.

**Arquivos de origem ja existentes**
- `frontend/src/modules/auth/services/settingsService.ts`
- `frontend/src/modules/auth/queries/useUserSettingsQuery.ts`
- `frontend/src/modules/auth/queries/useUpdateUserSettingsMutation.ts`
- `frontend/src/providers/index.tsx`

**Arquivos alvo**
- `frontend/src/modules/settings/services/settingsService.ts`
- `frontend/src/modules/settings/queries/settingsKeys.ts`
- `frontend/src/modules/settings/queries/useUserSettingsQuery.ts`
- `frontend/src/modules/settings/queries/useUpdateUserSettingsMutation.ts`
- `frontend/src/modules/settings/types/settings.ts`
- `frontend/src/providers/index.tsx`

**Mudancas planejadas**
- Mover o contrato tipado e os hooks para `modules/settings`.
- Criar query keys proprias de settings, em vez de mantelas em `authKeys`.
- Atualizar `SettingsHydrator` para consumir o novo modulo.
- Se necessario, manter reexports temporarios em `modules/auth` para reduzir churn local.

**Decisao importante**
- A pagina `configuracoes/page.tsx` continua simples e composicional. O split visual de workspaces fica para T009.

### T003 — Mapear capacidades do navegador e estado operacional

**Objetivo tecnico**
Publicar um estado consolidado client-only para permissao, suporte, foco e visibilidade, sem depender de componentes de tela e sem usar o store gigante de Today.

**Arquivos alvo**
- `frontend/src/modules/notifications/types/capability.ts`
- `frontend/src/modules/notifications/services/browserNotificationCapability.ts`
- `frontend/src/modules/notifications/hooks/useNotificationCapability.ts`
- `frontend/src/modules/notifications/**/*.test.ts`

**Mudancas planejadas**
- Implementar um service puro que retorna snapshot de capability e assinatura de eventos do browser.
- Implementar hook que combina capability local com `notificationsEnabled` vindo de Settings.
- Garantir comportamento seguro em SSR e hidraçao.

**Decisao importante**
- Nao usar Zustand aqui no primeiro corte. O hook pode encapsular subscription e expor um state derivado simples.

### T004 — Implementar motor de entrega e deduplicacao

**Objetivo tecnico**
Criar o nucleo deterministico do dominio Notifications para decisao de canal e deduplicacao em memoria.

**Arquivos alvo**
- `frontend/src/modules/notifications/types/events.ts`
- `frontend/src/modules/notifications/types/delivery.ts`
- `frontend/src/modules/notifications/services/notificationDeliveryEngine.ts`
- `frontend/src/modules/notifications/services/notificationDedupeStore.ts`
- `frontend/src/modules/notifications/store/useNotificationsStore.ts` ou facade equivalente leve
- `frontend/src/modules/notifications/**/*.test.ts`

**Mudancas planejadas**
- Definir tipos canonicos de evento operacional.
- Implementar engine pura que recebe evento + capability state e devolve `DeliveryDecision`.
- Implementar dedupe curto em memoria por chave estavel.
- Expor motivo de degradacao para consumo futuro em Settings.

**Fora do escopo explicito**
- persistencia local de historico
- sincronizacao multiaba
- recovery na retomada
- agendamento da revisao diaria

**Decisao de tamanho**
- O ticket permanece como L porque ainda e um nucleo coeso de dominio.
- Se qualquer item fora de escopo entrar, ele precisa ser quebrado antes da implementacao.

## Contratos tecnicos iniciais do bloco

### Settings frontend

```typescript
export interface UserSettingsDTO {
  cycleStartHour: string;
  dailyReviewTime: string;
  notificationsEnabled: boolean;
  timezone: string;
}

export type UpdateUserSettingsInput = Partial<UserSettingsDTO>;
```

### Capability de notificacao

```typescript
export interface NotificationCapabilityState {
  permission: 'default' | 'granted' | 'denied' | 'unsupported';
  productEnabled: boolean;
  supportsBrowserNotification: boolean;
  visibilityState: DocumentVisibilityState;
  windowFocused: boolean;
}
```

### Evento operacional e decisao de entrega

```typescript
export type OperationalNotificationEventType =
  | 'activity-pulse-due'
  | 'activity-pulse-expired'
  | 'daily-review-due'
  | 'recovery-pending';

export interface OperationalNotificationEvent {
  eventId: string;
  type: OperationalNotificationEventType;
  occurredAt: string;
  expiresAt?: string;
  context?: Record<string, string | number | boolean | null>;
}

export interface DeliveryDecision {
  channel: 'in-app' | 'browser' | 'suppressed' | 'recovery';
  reason: string;
}
```

## Matriz de riscos do bloco

| Risco | Onde aparece | Mitigacao |
|------|---------------|-----------|
| Settings continuar acoplado a auth | T002 | extracao incremental com modulo proprio e reexport temporario |
| Capability nascer em componente de tela | T003 | service client-only + hook dedicado |
| T004 inchar com recovery e historico | T004 | escopo explicito em memoria apenas |
| Misturar permissao do browser com preferencia do produto | T001-T003 | tipos separados e testes de shape |
| Notifications ler direto o store gigante de Today cedo demais | T003-T004 | motor isolado e sem dependencia de Today neste bloco |

## Validacao esperada por ticket

- **T001:** testes backend de schema e DTO
- **T002:** testes de service, query hook e hidratacao global
- **T003:** testes de capability para suporte, permissao, foco e visibilidade
- **T004:** testes de engine para selecao de canal, dedupe e degradacao

## Resultado esperado ao fim do bloco

- Backend e frontend passam a concordar sobre o contrato de Settings operacionais.
- O frontend tem um modulo `settings` proprio, separado de auth.
- O frontend tem um modulo `notifications` proprio, mesmo ainda sem fluxos finais de pulso e revisao diaria.
- A partir desse ponto, T005-T010 conseguem evoluir por cima de contratos e fronteiras ja estaveis.

---
*Planejamento tecnico derivado do Core Flow e dos tickets aprovados do epic Notificacoes Operacionais do WorkCycle*