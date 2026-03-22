# [T010] Integrar aprovacao, ignorar e silenciar no frontend da agenda

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-05  
> **Depende de:** T007, T008, T009 | **Bloqueia:** T012, T013  
> **Assignee:** - | **Status:** Backlog

## Contexto
Depois de o backend de accounting existir, o frontend precisa oferecer a fila semi-ativa de decisao operacional nos pontos certos da UX: widgets do dia e, quando fizer sentido, a propria tela `/agenda`.

## O que fazer
Adicionar acoes de aprovar, ignorar e silenciar eventos no frontend, incluindo o vinculo opcional a projeto e a atualizacao consistente do estado operacional da agenda.

### Arquivos esperados / impactados
- `frontend/src/modules/agenda/components/` - modificar ou criar componentes de decisoes operacionais
- `frontend/src/modules/agenda/queries/` - criar mutations de accounting
- `frontend/src/modules/agenda/services/agendaService.ts` - modificar ou extrair service especifico
- `frontend/src/modules/projects/queries/useProjectsQuery.ts` - reutilizar para selecao de projeto
- `frontend/src/modules/today/components/TodayPlannerOverview/index.tsx` - modificar, se o widget estiver ali
- `frontend/src/modules/weekly/components/WeeklyBalanceWorkspace/index.tsx` - modificar, se o widget expor acoes

## Criterios de Aceite

- [ ] O usuario consegue aprovar, ignorar e silenciar eventos diretamente da UX operacional
- [ ] Aprovacao permite informar minutos aprovados e projeto opcional
- [ ] O estado visual do evento e atualizado apos resposta do backend
- [ ] Eventos silenciados deixam de aparecer como pendencia operacional futura
- [ ] Erros de mutation sao exibidos sem perder o contexto do evento
- [ ] Testes cobrem approve, ignore e silence no frontend

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface EventAccountingFormValues {
  status: 'approved' | 'ignored' | 'silenced';
  approvedMinutes?: number;
  projectId?: string | null;
}
```

### Regras de Negocio
- O frontend nao recalcula localmente a regra de accounting; ele apenas representa o contrato do backend.
- Projeto na aprovacao e opcional no primeiro passo, mas deve continuar editavel depois.

### Edge Cases
- [ ] Usuario aprova evento e a reconciliacao o marca para revisao depois
- [ ] Projeto e removido ou desativado entre a abertura do formulario e o submit
- [ ] Evento some do widget apos ser silenciado e precisa manter feedback compreensivel

## Notas de Implementacao
Se houver duvida de UX entre widget e `/agenda`, priorizar a fila operacional no widget e reutilizar componentes na tela de agenda sem duplicar comportamento.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
