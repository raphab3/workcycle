# [T006] Entregar accounting operacional de eventos ponta a ponta

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-05  
> **Depende de:** T002, T004, T005 | **Bloqueia:** T007, T008  
> **Assignee:** - | **Status:** Backlog

## Contexto
O plano anterior quebrava accounting em backend e frontend, mas o valor real da feature so aparece quando a decisao operacional pode ser tomada na interface e refletida imediatamente no estado do evento. O slice precisa nascer ponta a ponta.

## O que fazer
Entregar accounting operacional de eventos de ponta a ponta, incluindo endpoints de decisao no backend e UX de aprovar, ignorar e silenciar no widget e, quando fizer sentido, na rota `/agenda`.

### Arquivos esperados / impactados
- `backend/src/modules/accounting/controllers/accounting.controller.ts` - modificar
- `backend/src/modules/accounting/services/` - criar ou modificar services de leitura e escrita operacional
- `backend/src/modules/accounting/repositories/accounting.repository.ts` - modificar
- `backend/src/modules/accounting/use-cases/` - criar ou modificar use cases de listagem e resolucao
- `backend/src/modules/accounting/accounting.module.ts` - modificar
- `frontend/src/modules/agenda/components/` - criar ou modificar componentes de decisao operacional
- `frontend/src/modules/agenda/queries/` - criar mutations de accounting
- `frontend/src/modules/agenda/services/agendaService.ts` - modificar ou extrair service especifico
- `frontend/src/modules/projects/queries/useProjectsQuery.ts` - reutilizar
- `frontend/src/modules/today/components/TodayPlannerOverview/index.tsx` - modificar, se o widget estiver ali
- `frontend/src/modules/weekly/components/WeeklyBalanceWorkspace/index.tsx` - modificar, se o widget expor acoes

## Criterios de Aceite

- [ ] Existem endpoints para listar pendencias e registrar `approved`, `ignored` e `silenced` por evento e data
- [ ] O usuario consegue aprovar, ignorar e silenciar eventos diretamente da UX operacional
- [ ] Aprovacao aceita `approvedMinutes` e `projectId` opcional
- [ ] Decisoes sao idempotentes por `event_id + date`
- [ ] Eventos silenciados deixam de reaparecer como pendencia operacional futura dentro da regra suportada
- [ ] O estado visual do evento e atualizado apos resposta do backend
- [ ] Testes cobrem backend e frontend para approve, ignore e silence

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface ResolveEventAccountingDTO {
  eventId: string;
  date: string;
  status: 'approved' | 'ignored' | 'silenced';
  approvedMinutes?: number;
  projectId?: string | null;
}
```

### Regras de Negocio
- Apenas eventos presentes no snapshot local podem receber decisao operacional.
- O frontend nao recalcula localmente regras de accounting; ele representa o contrato do backend.

### Edge Cases
- [ ] Serie recorrente sem `recurringEventId` consistente
- [ ] Projeto removido ou desativado entre abertura e submit
- [ ] Evento alterado apos aprovacao precisa de revisao

## Notas de Implementacao
Se houver duvida de UX, priorizar a fila operacional no widget e reutilizar os mesmos componentes na `/agenda`.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
