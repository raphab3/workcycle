# [T007] Integrar impacto aprovado da agenda ao ciclo ponta a ponta

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-06  
> **Depende de:** T006 | **Bloqueia:** T008  
> **Assignee:** - | **Status:** Backlog

## Contexto
O desconto de horas no ciclo so faz sentido quando backend e frontend fecham a cadeia completa: accounting consolidado, agregacao por projeto e representacao clara do impacto em `/hoje`. Separar isso em dois tickets aumenta acoplamento e reduz validabilidade da entrega.

## O que fazer
Integrar o impacto aprovado da agenda ao dominio `cycle` de ponta a ponta, incluindo backend de agregacao e frontend de exibicao do desconto de horas e das revisoes pendentes.

### Arquivos esperados / impactados
- `backend/src/modules/cycle/controllers/cycle.controller.ts` - modificar
- `backend/src/modules/cycle/services/cycle-finder.service.ts` - modificar
- `backend/src/modules/cycle/use-cases/get-cycle-status.use-case.ts` - modificar
- `backend/src/modules/cycle/use-cases/` - criar use case especifico, se necessario
- `backend/src/modules/cycle/cycle.module.ts` - modificar
- `frontend/src/modules/today/components/TodayPlannerOverview/index.tsx` - modificar
- `frontend/src/modules/today/components/TodayCycleForm/index.tsx` - modificar, se necessario
- `frontend/src/modules/today/` - criar ou adaptar query/service do ciclo
- `frontend/src/modules/today/types/` - criar ou modificar tipos de impacto

## Criterios de Aceite

- [ ] O resumo do ciclo considera apenas eventos `approved`
- [ ] O calculo e idempotente por `event_id + date`
- [ ] `/hoje` mostra o impacto total das reunioes aprovadas na disponibilidade do dia
- [ ] Quando houver projetos vinculados, o resumo por projeto fica acessivel ao usuario
- [ ] Eventos alterados ou removidos apos aprovacao podem sinalizar revisao pendente
- [ ] Testes cobrem agregacao, ausencia de impacto e estado de revisao

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface CycleAgendaImpactDTO {
  approvedMinutesTotal: number;
  approvedMinutesByProject: Array<{
    projectId: string;
    minutes: number;
  }>;
  hasReviewPending: boolean;
}
```

### Regras de Negocio
- `pending`, `ignored` e `silenced` nao abatem horas do ciclo.
- Agenda entra como ajuste operacional do ciclo, nao como substituicao da logica principal da tela.

### Edge Cases
- [ ] Evento aprovado e removido remotamente
- [ ] Dois eventos aprovados se sobrepoem no mesmo dia
- [ ] Evento sem projeto entra apenas no total geral

## Notas de Implementacao
Evitar acoplamento direto do ciclo ao schema bruto de `calendar_events`; o consumo deve vir da camada consolidada de accounting.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
