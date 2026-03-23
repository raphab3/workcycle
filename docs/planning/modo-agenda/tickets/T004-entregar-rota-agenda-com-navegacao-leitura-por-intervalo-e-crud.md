# [T004] Entregar rota `/agenda` com navegacao, leitura por intervalo e CRUD

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T001, T002, T003 | **Bloqueia:** T005, T006, T008  
> **Assignee:** - | **Status:** Backlog

## Objetivo
Concluir a experiencia principal de produto do Modo Agenda na rota `/agenda`, usando os contratos entregues em T001, T002 e T003 para leitura por intervalo, refresh manual e CRUD real de eventos.

## Escopo desta entrega

### Responsabilidade de rota vs modulo
- `frontend/src/app/(pages)/agenda/page.tsx` permanece como camada de composicao da rota.
- `frontend/src/modules/agenda/` concentra service, query keys, query hooks, mutation hooks, tipos, formularios e componentes de workspace.
- `frontend/src/shared/components/AppNavigation/` apenas adiciona a entrada de navegacao; nao deve absorver logica da agenda.

### Responsabilidade de dados
- `agendaService.ts` encapsula chamadas HTTP.
- hooks em `frontend/src/modules/agenda/queries/` separam leitura e mutacoes (`useAgendaEventsQuery`, `useRefreshAgendaMutation`, `useCreateAgendaEventMutation`, `useUpdateAgendaEventMutation`, `useDeleteAgendaEventMutation`).
- a pagina consome hooks e componentes; nao reimplementa parsing de payload, invalidacao nem transformacoes de negocio.

## Contratos esperados

### Dependencias consumidas do backend
- Leitura por intervalo entregue por T002.
- Refresh manual entregue por T002.
- Create, update e delete entregues por T003.

### DTO minimo esperado no frontend
```typescript
interface AgendaEventFormValues {
  calendarId: string;
  title: string;
  startAt: string;
  endAt: string;
  description?: string;
  location?: string;
}
```

## Arquivos esperados / impactados
- `frontend/src/app/(pages)/agenda/page.tsx`
- `frontend/src/app/(pages)/agenda/page.test.tsx`
- `frontend/src/app/(pages)/agenda/styles.ts`
- `frontend/src/shared/components/AppNavigation/index.tsx`
- `frontend/src/shared/components/AppNavigation/index.test.tsx`
- `frontend/src/modules/agenda/components/AgendaWorkspace/index.tsx`
- `frontend/src/modules/agenda/components/AgendaWorkspace/styles.ts`
- `frontend/src/modules/agenda/components/AgendaWorkspace/index.test.tsx`
- `frontend/src/modules/agenda/components/AgendaEventForm/index.tsx`
- `frontend/src/modules/agenda/components/AgendaEventForm/schema.ts`
- `frontend/src/modules/agenda/components/AgendaEventForm/types.ts`
- `frontend/src/modules/agenda/components/AgendaEventForm/styles.ts`
- `frontend/src/modules/agenda/services/agendaService.ts`
- `frontend/src/modules/agenda/services/agendaService.test.ts`
- `frontend/src/modules/agenda/queries/agendaKeys.ts`
- `frontend/src/modules/agenda/queries/useAgendaEventsQuery.ts`
- `frontend/src/modules/agenda/queries/useRefreshAgendaMutation.ts`
- `frontend/src/modules/agenda/queries/useCreateAgendaEventMutation.ts`
- `frontend/src/modules/agenda/queries/useUpdateAgendaEventMutation.ts`
- `frontend/src/modules/agenda/queries/useDeleteAgendaEventMutation.ts`
- `frontend/src/modules/agenda/queries/agendaQueries.test.tsx`
- `frontend/src/modules/agenda/types/agenda.ts`
- `frontend/src/modules/agenda/utils/agenda.ts`

## Criterios de aceite
- [ ] Existe rota navegavel `/agenda` integrada ao App Router e a navegacao principal.
- [ ] A rota lista eventos por intervalo com ordenacao consistente e filtro coerente com calendarios incluidos.
- [ ] O usuario consegue disparar refresh manual da janela atual e ver feedback de loading ou stale state.
- [ ] O usuario consegue criar, editar e excluir eventos consumindo os endpoints reais do backend.
- [ ] Estados de loading, empty, error, stale, success e degradacao parcial existem na rota.
- [ ] Quando uma conta ou calendario falha, a tela continua utilizavel com os demais dados e comunica a degradacao de forma explicita.
- [ ] Os testes cobrem navegacao, leitura, refresh, create, update, delete e os principais estados da tela.

## Edge cases obrigatorios
- [ ] Usuario acessa `/agenda` sem nenhuma conta Google conectada.
- [ ] Usuario possui conta conectada, mas nenhum calendario incluido.
- [ ] Create tenta usar calendario excluido por toggle e recebe erro coerente.
- [ ] Refresh manual acontece durante mutation em andamento sem deixar cache divergente.
- [ ] Lista continua util quando apenas parte das fontes retorna erro.

## Nao faz parte
- Grade visual de calendario.
- Regras de accounting na UX principal; isso fica em T006.
- Impacto no ciclo; isso fica em T007.

## Notas de implementacao
- Como a rota e os componentes basicos de `modules/agenda/` ja existem no repo, este ticket deve tratar completude e endurecimento da entrega, nao necessariamente criacao do zero.
- A pagina deve seguir o padrao do repositorio: rota compoe, modulo implementa dominio.
- Se for necessario extrair componentes adicionais para manter o workspace legivel, manter a logica de dados dentro de `modules/agenda/`.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
