# [T005] Exibir widget lateral de agenda em Hoje e Semana

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-04  
> **Depende de:** T002, T004 | **Bloqueia:** T006, T008  
> **Assignee:** - | **Status:** Backlog

## Contexto
Uma das entregas centrais do epic e expor os proximos eventos do dia no contexto real de trabalho. Esse widget precisa reutilizar a mesma fonte operacional da agenda, sem criar uma segunda interpretacao dos eventos.

## O que fazer
Adicionar um widget lateral minimalista em `/hoje` e `/semana` para exibir os proximos eventos do dia, incluindo estados de loading, vazio, erro e degradacao parcial.

### Arquivos esperados / impactados
- `frontend/src/app/(pages)/hoje/page.tsx` - modificar, se necessario
- `frontend/src/app/(pages)/semana/page.tsx` - modificar, se necessario
- `frontend/src/modules/today/components/TodayPlannerOverview/index.tsx` - modificar
- `frontend/src/modules/weekly/components/WeeklyBalanceWorkspace/index.tsx` - modificar
- `frontend/src/modules/agenda/components/` - criar componente compartilhado de widget, se necessario
- `frontend/src/modules/agenda/queries/` - reutilizar query de eventos do dia

## Criterios de Aceite

- [ ] `/hoje` exibe os proximos eventos do dia sem sair da tela de trabalho
- [ ] `/semana` exibe o mesmo resumo operacional adaptado ao layout da pagina
- [ ] Eventos de calendarios excluidos nao aparecem
- [ ] Falha parcial de sync aparece de forma localizada no widget
- [ ] Quando nao houver eventos, a lateral permanece util e sem ruido excessivo
- [ ] Testes cobrem loading, vazio, erro e lista preenchida

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface AgendaDayWidgetItem {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  calendarName: string;
  accountEmail: string;
}
```

### Regras de Negocio
- O widget consome o mesmo read model da agenda.
- O resumo do dia precisa respeitar o timezone operacional do produto.

### Edge Cases
- [ ] Dois eventos no mesmo horario em calendarios distintos
- [ ] Layout lateral reduzido em telas menores
- [ ] Conta degradada coexistindo com outra funcional

## Notas de Implementacao
Aprovacao e silenciamento entram no ticket seguinte para manter este slice focado em visibilidade do dia.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
