# [T005] Exibir widget lateral de agenda em Hoje e Semana

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-04  
> **Depende de:** T002, T004 | **Bloqueia:** T006, T008  
> **Assignee:** - | **Status:** Backlog

## Objetivo
Levar a agenda operacional para o contexto de trabalho das rotas `/hoje` e `/semana` sem criar nova fonte de verdade, usando o mesmo read model de eventos e a mesma semantica de degradacao ja exposta em `/agenda`.

## Escopo desta entrega

### Responsabilidade de rota vs modulo
- As rotas `/hoje` e `/semana` apenas posicionam o widget dentro do layout existente.
- O comportamento do widget deve viver em componente reutilizavel no dominio `modules/agenda/` ou em componente compartilhado explicitamente orientado a agenda.
- `modules/today/` e `modules/weekly/` nao devem duplicar service ou query de agenda.

### Responsabilidade de dados
- Reutilizar `useAgendaEventsQuery` ou um hook derivado do mesmo contrato para a janela do dia.
- O widget pode filtrar ou resumir no frontend apenas quando isso nao criar divergencia com o read model base.

## Contratos esperados

### DTO minimo esperado no widget
```typescript
interface AgendaDayWidgetItem {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  calendarName: string;
  accountEmail: string;
  isAllDay: boolean;
}
```

## Arquivos esperados / impactados
- `frontend/src/app/(pages)/hoje/page.tsx`
- `frontend/src/app/(pages)/hoje/page.test.tsx`
- `frontend/src/app/(pages)/semana/page.tsx`
- `frontend/src/app/(pages)/semana/page.test.tsx`
- `frontend/src/modules/today/components/TodayPlannerOverview/index.tsx`
- `frontend/src/modules/today/components/TodayPlannerOverview/styles.ts`
- `frontend/src/modules/today/components/TodayPlannerOverview/index.test.tsx`
- `frontend/src/modules/weekly/components/WeeklyBalanceWorkspace/index.tsx`
- `frontend/src/modules/weekly/components/WeeklyBalanceWorkspace/styles.ts`
- `frontend/src/modules/weekly/components/WeeklyBalanceWorkspace/index.test.tsx`
- `frontend/src/modules/agenda/components/` para o widget compartilhado, se necessario
- `frontend/src/modules/agenda/queries/useAgendaEventsQuery.ts` ou hook derivado da mesma chave
- `frontend/src/modules/agenda/types/agenda.ts`

## Criterios de aceite
- [ ] `/hoje` exibe os proximos eventos operacionais do dia sem sair do fluxo principal da tela.
- [ ] `/semana` exibe o mesmo resumo operacional, adaptado ao layout existente da pagina.
- [ ] O widget usa a mesma fonte operacional da agenda e respeita calendarios incluidos, timezone do dia e degradacao parcial.
- [ ] Eventos de calendarios excluidos ou silenciados nao aparecem.
- [ ] Falha parcial de sync aparece de forma localizada no widget, sem derrubar o restante da pagina.
- [ ] Quando nao houver eventos, o estado vazio continua util e sem competir visualmente com o fluxo principal da tela.
- [ ] Existem testes cobrindo loading, vazio, erro localizado e lista preenchida.

## Edge cases obrigatorios
- [ ] Dois eventos no mesmo horario em calendarios distintos aparecem de forma estavel e compreensivel.
- [ ] Layout lateral continua legivel em largura reduzida.
- [ ] Uma conta degradada coexistindo com outra funcional nao mascara os eventos validos.
- [ ] Evento all-day nao ocupa o widget como se tivesse horario especifico incorreto.

## Nao faz parte
- Acoes de approve, ignore ou silence.
- Desconto no ciclo.
- Novo endpoint dedicado so para o widget, salvo se a API existente provar ser insuficiente de forma objetiva.

## Notas de implementacao
- O widget deve nascer como reaproveitamento da agenda operacional e nao como segunda interpretacao de eventos.
- Se a UX exigir truncar lista ou agrupar eventos, manter o criterio deterministico e consistente entre `/hoje` e `/semana`.
- Aprovacao e silenciamento entram no ticket seguinte para manter este slice focado em visibilidade do dia.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
