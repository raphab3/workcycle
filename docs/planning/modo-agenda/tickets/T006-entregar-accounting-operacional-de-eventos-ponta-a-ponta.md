# [T006] Entregar accounting operacional de eventos ponta a ponta

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-05  
> **Depende de:** T002, T004, T005 | **Bloqueia:** T007, T008  
> **Assignee:** - | **Status:** Backlog

## Objetivo
Entregar a camada de decisao operacional sobre eventos sincronizados, permitindo aprovar, ignorar e silenciar com comportamento idempotente por evento e data, refletido imediatamente na UX e pronto para ser consumido por `cycle` no ticket seguinte.

## Escopo desta entrega

### Backend
- `accounting` passa a ser a fronteira oficial das decisoes do usuario sobre relevancia operacional do evento.
- `events` continua dono do snapshot; `accounting` consulta esse snapshot, mas nao passa a editar evento remoto.
- `projects` e usado apenas para validar `projectId` opcional quando houver aprovacao.

### Frontend
- Acoes de approve, ignore e silence devem surgir no widget operacional e podem ser reutilizadas em `/agenda` quando isso nao gerar segunda UX concorrente.
- Queries e mutations de accounting devem ficar no dominio de agenda ou em camada claramente dedicada, sem misturar contrato de listagem de eventos com contrato de decisao operacional.

## Contratos esperados

### Responsabilidades de endpoint
- O modulo `accounting` deve expor leitura das pendencias/statuses operacionais por data ou intervalo relevante para a UI.
- O modulo `accounting` deve expor uma mutacao para registrar `approved`, `ignored` e `silenced` por `eventId + date`.
- Se o controller atual usar paths diferentes, preservar a convencao existente e garantir estas responsabilidades.

### DTO minimo esperado
```typescript
interface ResolveEventAccountingDTO {
  eventId: string;
  date: string;
  status: 'approved' | 'ignored' | 'silenced';
  approvedMinutes?: number;
  projectId?: string | null;
}
```

## Arquivos esperados / impactados
- `backend/src/modules/accounting/controllers/accounting.controller.ts`
- `backend/src/modules/accounting/services/accounting-finder.service.ts`
- `backend/src/modules/accounting/repositories/accounting.repository.ts`
- `backend/src/modules/accounting/use-cases/list-accounting-statuses.use-case.ts`
- `backend/src/modules/accounting/use-cases/` para use cases de resolucao, se ainda faltarem
- `backend/src/modules/accounting/accounting.module.ts`
- `backend/src/modules/events/repositories/events.repository.ts` somente se faltar leitura necessaria do snapshot para validacao
- `backend/src/modules/projects/` apenas no ponto de validacao do `projectId`
- `frontend/src/modules/agenda/components/` para componentes de decisao operacional
- `frontend/src/modules/agenda/queries/` para queries e mutations de accounting
- `frontend/src/modules/agenda/services/agendaService.ts` ou service extraido equivalente, se o contrato de accounting ficar distinto do CRUD de eventos
- `frontend/src/modules/projects/queries/useProjectsQuery.ts`
- `frontend/src/modules/today/components/TodayPlannerOverview/index.tsx`
- `frontend/src/modules/weekly/components/WeeklyBalanceWorkspace/index.tsx` somente se o widget desta tela expuser as acoes

## Criterios de aceite
- [ ] Existem endpoints equivalentes para listar pendencias/statuses e registrar `approved`, `ignored` e `silenced` por `eventId + date`.
- [ ] O usuario consegue aprovar, ignorar e silenciar eventos diretamente da UX operacional suportada.
- [ ] Aprovacao aceita `approvedMinutes` e `projectId` opcional, validando projeto invalido ou desativado antes de persistir.
- [ ] Decisoes sao idempotentes por `eventId + date`; repetir a mesma decisao nao duplica linhas nem efeito futuro.
- [ ] Eventos silenciados deixam de reaparecer como pendencia operacional futura dentro da regra de serie suportada pelo snapshot atual.
- [ ] Quando um evento aprovado for alterado ou removido externamente, a proxima leitura ou sync pelo menos sinaliza revisao pendente; a decisao nao fica invisivelmente assumida como valida para sempre.
- [ ] O estado visual do evento e atualizado apos resposta do backend, sem recalcular regras de accounting exclusivamente no frontend.
- [ ] Existem testes de backend e frontend cobrindo approve, ignore, silence, idempotencia, validacao de projeto e sinalizacao de revisao.

## Edge cases obrigatorios
- [ ] Serie recorrente sem `recurringEventId` consistente usa fallback controlado e explicitamente documentado, sem silenciar eventos indevidos em massa.
- [ ] Projeto removido ou desativado entre abertura do formulario e submit retorna erro compreensivel.
- [ ] Evento alterado apos aprovacao entra em revisao e nao gera segunda aprovacao duplicada para a mesma data.
- [ ] Repetir `ignore` ou `silence` para o mesmo evento/data nao cria duplicidade.

## Nao faz parte
- Recalcular e exibir impacto no ciclo; isso fica em T007.
- Criar novas regras automaticas de aprovacao sem acao do usuario.
- Resolver sincronizacao em tempo real ou webhooks.

## Notas de implementacao
- A chave de idempotencia minima desta entrega e `event_id + date`; qualquer modelagem adicional precisa preservar essa regra como contrato observavel.
- Revisao de evento alterado/removido deve ficar explicita no read model ou em flag equivalente, mesmo que a estrategia final de recalculo do ciclo permaneca conservadora no MVP.
- Se houver duvida de UX, priorizar a fila operacional no widget e reutilizar os mesmos componentes na `/agenda`.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
