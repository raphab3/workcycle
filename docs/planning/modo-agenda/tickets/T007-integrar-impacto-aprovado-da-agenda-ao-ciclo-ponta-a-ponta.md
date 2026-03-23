# [T007] Integrar impacto aprovado da agenda ao ciclo ponta a ponta

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-06  
> **Depende de:** T006 | **Bloqueia:** T008  
> **Assignee:** - | **Status:** Backlog

## Objetivo
Fazer o dominio `cycle` consumir o resultado aprovado de `accounting` para descontar horas disponiveis do dia e expor esse impacto em `/hoje`, sem transformar `cycle` em dono dos eventos de agenda.

## Escopo desta entrega

### Backend
- `cycle` deve consumir uma camada consolidada de accounting, nao o schema bruto de `calendar_events`.
- `cycle` deve retornar impacto total, impacto por projeto e sinalizacao de revisao pendente quando a reconciliacao da agenda tornar o desconto duvidoso.
- O comportamento observavel precisa ser idempotente por `eventId + date`.

### Frontend
- `/hoje` exibe o impacto aprovado no resumo do dia e comunica quando houver revisao pendente.
- `modules/today/` consome o contrato de ciclo; nao deve recomputar localmente a regra de desconto da agenda.

## Contratos esperados

### Responsabilidades de endpoint
- `GET` do status do ciclo e/ou da sessao de hoje deve passar a retornar os dados de impacto da agenda aprovados.
- Se os endpoints atuais ja existem, a entrega deve expandir o payload atual em vez de criar uma API paralela sem necessidade.

### DTO minimo esperado
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

## Arquivos esperados / impactados
- `backend/src/modules/cycle/controllers/cycle.controller.ts`
- `backend/src/modules/cycle/services/cycle-finder.service.ts`
- `backend/src/modules/cycle/repositories/cycle.repository.ts` somente se a leitura do resumo precisar persistencia adicional
- `backend/src/modules/cycle/use-cases/get-cycle-status.use-case.ts`
- `backend/src/modules/cycle/use-cases/get-today-session.use-case.ts`
- `backend/src/modules/cycle/use-cases/shared-today-session.ts` se o resumo diario for centralizado ali
- `backend/src/modules/cycle/types/today.ts`
- `backend/src/modules/cycle/cycle.schemas.ts`
- `backend/src/modules/cycle/cycle.module.ts`
- `frontend/src/modules/today/services/todayService.ts`
- `frontend/src/modules/today/queries/useTodaySessionQuery.ts`
- `frontend/src/modules/today/queries/todayKeys.ts`
- `frontend/src/modules/today/queries/todayQueries.test.tsx`
- `frontend/src/modules/today/components/TodayPlannerOverview/index.tsx`
- `frontend/src/modules/today/components/TodayPlannerOverview/index.test.tsx`
- `frontend/src/modules/today/components/TodayCycleForm/index.tsx` somente se o resumo impactar diretamente o formulario
- `frontend/src/modules/today/types/today.ts`

## Criterios de aceite
- [ ] O resumo do ciclo considera apenas eventos com decisao `approved`.
- [ ] O calculo e observavelmente idempotente por `eventId + date`; o mesmo evento nao pode abater horas duas vezes apos refresh ou recalculo.
- [ ] `/hoje` mostra o impacto total das reunioes aprovadas na disponibilidade do dia.
- [ ] Quando houver projetos vinculados, o resumo por projeto fica acessivel ao usuario sem exigir navegacao extra fora do fluxo principal.
- [ ] Quando um evento aprovado for alterado ou removido externamente, o ciclo pelo menos sinaliza `hasReviewPending` na proxima leitura; o desconto nao pode continuar parecendo definitivamente reconciliado sem aviso.
- [ ] Eventos `pending`, `ignored` e `silenced` nao entram no desconto.
- [ ] Existem testes cobrindo agregacao sem duplicidade, ausencia de impacto, impacto por projeto e estado de revisao.

## Edge cases obrigatorios
- [ ] Evento aprovado e removido remotamente.
- [ ] Dois eventos aprovados se sobrepoem no mesmo dia e ainda assim cada um entra apenas uma vez na agregacao.
- [ ] Evento aprovado sem projeto vinculado entra apenas no total geral.
- [ ] Dia sem agenda aprovada continua retornando resumo coerente do ciclo.

## Nao faz parte
- Reaprovar automaticamente eventos alterados externamente.
- Reescrever a logica principal de planejamento manual do ciclo.
- Exibir analytics avancado alem do impacto operacional aprovado.

## Notas de implementacao
- O consumo do ciclo deve vir da camada consolidada de accounting, nunca de leitura ad hoc direta em `calendar_events`.
- Para o MVP, a revisao pendente precisa ser explicita. A estrategia final de auto-recalculo apos mudanca externa permanece limitada ao escopo ja aberto no epic e nao deve expandir esta entrega para automacoes adicionais.
- Idempotencia por `eventId + date` e requisito funcional, nao apenas detalhe interno de persistencia.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
