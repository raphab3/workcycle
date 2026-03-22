# [T007] Implementar leitura por intervalo e CRUD na rota /agenda

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T005, T006 | **Bloqueia:** T010, T013  
> **Assignee:** - | **Status:** Backlog

## Contexto
Com a fundacao pronta e o backend write-through disponivel, a rota `/agenda` precisa entregar a experiencia principal do epic: listar eventos do intervalo corrente, atualizar manualmente e permitir criacao, edicao e exclusao de eventos.

## O que fazer
Implementar a tela `/agenda` com leitura por intervalo, refresh manual, formularios de create e edit, e mutation de delete consumindo o backend de events.

### Arquivos esperados / impactados
- `frontend/src/app/(pages)/agenda/page.tsx` - modificar
- `frontend/src/modules/agenda/components/` - criar componentes de workspace, lista e formulario
- `frontend/src/modules/agenda/queries/` - criar query e mutations
- `frontend/src/modules/agenda/services/agendaService.ts` - modificar
- `frontend/src/modules/agenda/types/` - modificar
- `frontend/src/modules/agenda/**/*.test.ts*` - criar

## Criterios de Aceite

- [ ] A tela lista eventos por intervalo com ordenacao consistente
- [ ] O usuario consegue disparar refresh manual da agenda
- [ ] Formularios de criacao e edicao validam payload antes de chamar mutation
- [ ] Delete atualiza a tela de forma consistente apos resposta do backend
- [ ] Estados de loading, empty, error, stale e success existem na rota
- [ ] A UX continua utilizavel quando apenas parte das contas ou calendarios esta disponivel
- [ ] Testes cobrem leitura, create, edit e delete no fluxo principal

## Detalhes Tecnicos

### Contrato / Interface
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

### Regras de Negocio
- O primeiro corte pode assumir visao cronologica/lista, sem obrigar grade visual de calendario.
- Sucesso visual deve refletir apenas o retorno confirmado do backend.

### Edge Cases
- [ ] Create em calendario excluido por toggle
- [ ] Edit de evento sincronizado por conta atualmente degradada
- [ ] Refresh manual durante mutation em andamento

## Notas de Implementacao
Se a visualizacao de calendario grade permanecer em aberto, explicitar isso no escopo da tela sem deixar ambiguidade para o usuario.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
