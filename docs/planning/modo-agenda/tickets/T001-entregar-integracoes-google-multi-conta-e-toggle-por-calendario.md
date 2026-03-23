# [T001] Entregar Integracoes Google multi-conta e toggle por calendario

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-01  
> **Depende de:** - | **Bloqueia:** T002, T004, T008  
> **Assignee:** - | **Status:** Backlog

## Objetivo
Fechar o slice de Integracoes Google que habilita o Modo Agenda a operar com multiplas contas e selecao operacional por calendario. Ao final deste ticket, `/configuracoes` deve ser a fonte de configuracao para quais calendarios entram na leitura da agenda, nos widgets e na contabilizacao futura.

## Escopo desta entrega

### Backend
- `auth` continua dono do fluxo OAuth e da geracao do link de conexao.
- `accounts` passa a expor o read model consolidado de contas Google conectadas e calendarios por conta.
- `accounts` passa a ser a fronteira oficial para alternar `google_calendars.is_included`.

### Frontend
- A rota `/configuracoes` permanece camada de composicao.
- `frontend/src/modules/auth/` concentra queries, mutation, tipos e UI de integracoes ja existentes.
- `AuthSettingsWorkspace` passa a representar claramente conta, calendarios, estado degradado e acao de reconexao quando aplicavel.

## Contratos esperados

### Responsabilidades de endpoint
- `GET /accounts/google` ou rota equivalente ja existente em `accounts.controller.ts` deve retornar contas conectadas com seus calendarios, estado da conta e metadados suficientes para distinguir fontes iguais em contas diferentes.
- `PATCH /accounts/google/calendars/:calendarId` ou rota equivalente ja existente deve alternar `isIncluded` sem apagar historico local nem disparar sync de eventos por conta propria.
- Se a implementacao atual usar paths diferentes, manter os paths existentes e garantir estas responsabilidades.

### DTO minimo esperado
```typescript
interface GoogleCalendarSummaryDTO {
  id: string;
  name: string;
  colorHex: string | null;
  isPrimary: boolean;
  isIncluded: boolean;
  syncedAt: string | null;
}

interface GoogleAccountConnectionDTO {
  id: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  needsReconnect: boolean;
  degradedReason?: string | null;
  calendars: GoogleCalendarSummaryDTO[];
}
```

## Arquivos esperados / impactados
- `backend/src/modules/accounts/controllers/accounts.controller.ts`
- `backend/src/modules/accounts/services/accounts-finder.service.ts`
- `backend/src/modules/accounts/services/accounts-writer.service.ts`
- `backend/src/modules/accounts/repositories/accounts.repository.ts`
- `backend/src/modules/accounts/use-cases/list-google-accounts.use-case.ts`
- `backend/src/modules/accounts/use-cases/update-google-calendar.use-case.ts`
- `backend/src/modules/accounts/accounts.schemas.ts`
- `backend/src/modules/accounts/accounts.module.ts`
- `backend/src/shared/database/schema/accounts.schema.ts` somente se faltar metadata ja prevista no epic
- `frontend/src/app/(pages)/configuracoes/page.tsx`
- `frontend/src/modules/auth/components/AuthSettingsWorkspace/index.tsx`
- `frontend/src/modules/auth/components/AuthSettingsWorkspace/styles.ts`
- `frontend/src/modules/auth/components/AuthSettingsWorkspace/index.test.tsx`
- `frontend/src/modules/auth/queries/useGoogleAccountsQuery.ts`
- `frontend/src/modules/auth/queries/useUpdateGoogleCalendarMutation.ts`
- `frontend/src/modules/auth/queries/authKeys.ts`
- `frontend/src/modules/auth/services/authService.ts`
- `frontend/src/modules/auth/types/auth.ts`

## Criterios de aceite
- [ ] `/configuracoes` exibe todas as contas Google conectadas com email, estado da conta e lista de calendarios por conta.
- [ ] Cada calendario deixa explicito a qual conta pertence, mesmo quando nomes sao iguais entre contas diferentes.
- [ ] Alternar `isIncluded` persiste no backend, atualiza a UI sem reload manual e invalida apenas as queries necessarias.
- [ ] Falha ou expiracao de token em uma conta aparece de forma localizada, sem bloquear a listagem e os toggles das demais contas.
- [ ] O payload de contas/calendarios e suficiente para ser reutilizado por `/agenda`, widgets e accounting sem novo endpoint de configuracao.
- [ ] O fluxo atual de conectar Google continua funcional.
- [ ] Existem testes cobrindo renderizacao multi-conta, sucesso do toggle, rollback visual em erro e degradacao localizada.

## Edge cases obrigatorios
- [ ] Duas contas com calendario `Primary` nao podem parecer a mesma fonte.
- [ ] Conta conectada sem calendarios retornados nao quebra a tela e mostra estado vazio local.
- [ ] Mutacao de toggle que falha precisa reverter o estado otimista ou evitar otimismo inseguro.
- [ ] Conta inativa ou expirada continua visivel para reconexao, sem desaparecer da configuracao.

## Nao faz parte
- Sync de eventos.
- Widget de agenda em `/hoje` ou `/semana`.
- CRUD de eventos.
- Regras de accounting ou impacto no ciclo.

## Notas de implementacao
- `accounts` e a fronteira de leitura e escrita de inclusao por calendario; `auth` nao deve acumular responsabilidade de negocio alem do OAuth.
- Alterar `isIncluded` nao remove `calendar_events` existentes nem historico de accounting ja registrado.
- Se houver divergencia entre contrato atual e nomes sugeridos aqui, preservar o naming do repo e manter equivalencia funcional.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
