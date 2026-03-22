# [T008] Exibir widget lateral de agenda em Hoje e Semana

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-04  
> **Depende de:** T004, T006 | **Bloqueia:** T010  
> **Assignee:** - | **Status:** Backlog

## Contexto
Uma das entregas centrais do epic e devolver visibilidade imediata do dia dentro das telas de trabalho existentes. O widget lateral precisa reutilizar a mesma fonte operacional da agenda, sem duplicar logica de dados.

## O que fazer
Adicionar um widget lateral minimalista em `/hoje` e `/semana` que exiba os proximos eventos do dia, com estados de loading, vazio, erro e degradacao parcial.

### Arquivos esperados / impactados
- `frontend/src/app/(pages)/hoje/page.tsx` - modificar, se necessario
- `frontend/src/app/(pages)/semana/page.tsx` - modificar, se necessario
- `frontend/src/modules/today/components/TodayPlannerOverview/index.tsx` - modificar
- `frontend/src/modules/weekly/components/WeeklyBalanceWorkspace/index.tsx` - modificar
- `frontend/src/modules/agenda/components/` - criar componente compartilhado de widget, se necessario
- `frontend/src/modules/agenda/queries/` - reutilizar ou criar query resumida do dia

## Criterios de Aceite

- [ ] `/hoje` exibe os proximos eventos do dia sem sair do contexto principal da tela
- [ ] `/semana` exibe o mesmo resumo operacional adaptado ao layout da tela
- [ ] Eventos de calendarios excluidos ou silenciados nao aparecem
- [ ] A falha parcial de sync aparece como estado degradado localizado no widget
- [ ] Quando nao houver eventos, a lateral permanece util e sem ruido excessivo
- [ ] Testes cobrem renderizacao de loading, vazio, erro e lista preenchida

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
- O widget deve consumir o mesmo read model da agenda, nao um endpoint com semantica divergente.
- O resumo do dia precisa respeitar o timezone operacional do produto.

### Edge Cases
- [ ] Dois eventos com mesmo horario em calendarios distintos
- [ ] Widget sem espaco lateral suficiente em layouts menores
- [ ] Conta degradada no widget enquanto outra entrega eventos normalmente

## Notas de Implementacao
Manter o widget minimalista. Acoes de aprovacao e silenciamento podem entrar depois, no ticket de accounting frontend.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
