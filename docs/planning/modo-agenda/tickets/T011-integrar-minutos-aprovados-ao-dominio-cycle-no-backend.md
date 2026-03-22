# [T011] Integrar minutos aprovados ao dominio Cycle no backend

> **Tipo:** API | **Tamanho:** M (3pts) | **Fluxo:** CF-06  
> **Depende de:** T009 | **Bloqueia:** T012  
> **Assignee:** - | **Status:** Backlog

## Contexto
O desconto de horas no ciclo nao pode depender de eventos brutos. O dominio `cycle` precisa consumir apenas a camada de accounting aprovada, mantendo o ciclo como dono da disponibilidade operacional, nao dos eventos externos.

## O que fazer
Expandir o backend de `cycle` para incorporar minutos aprovados de agenda no resumo diario, com agregacao por projeto quando houver vinculo e sinalizacao de revisoes pendentes.

### Arquivos esperados / impactados
- `backend/src/modules/cycle/controllers/cycle.controller.ts` - modificar
- `backend/src/modules/cycle/services/cycle-finder.service.ts` - modificar
- `backend/src/modules/cycle/use-cases/get-cycle-status.use-case.ts` - modificar
- `backend/src/modules/cycle/use-cases/` - criar use case especifico se necessario
- `backend/src/modules/cycle/cycle.module.ts` - modificar
- `backend/src/modules/accounting/` - reutilizar read model de minutos aprovados

## Criterios de Aceite

- [ ] O resumo do ciclo passa a considerar apenas eventos `approved`
- [ ] O calculo e idempotente por `event_id + date`
- [ ] O payload do ciclo informa o impacto total de agenda no dia
- [ ] Quando houver projeto vinculado, o resumo consegue agregar minutos aprovados por projeto
- [ ] Eventos em revisao ou alterados apos aprovacao podem ser sinalizados ao frontend
- [ ] Testes de service cobrem agregacao, idempotencia e evento alterado apos aprovacao

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
- O ciclo continua permitndo planejamento manual; agenda e ajuste operacional adicional.

### Edge Cases
- [ ] Evento aprovado e removido remotamente
- [ ] Dois eventos aprovados se sobrepoem no mesmo dia
- [ ] Evento sem projeto precisa entrar apenas no total geral

## Notas de Implementacao
Evitar acoplamento do ciclo ao schema bruto de `calendar_events`. O consumo deve ocorrer via leitura consolidada de accounting.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
