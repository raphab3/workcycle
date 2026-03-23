# [T004] Entregar rota `/agenda` com navegacao, leitura por intervalo e CRUD

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T001, T002, T003 | **Bloqueia:** T005, T006, T008  
> **Assignee:** - | **Status:** Backlog

## Contexto
O plano anterior separava foundation e entrega da rota `/agenda`, mas isso criava um ticket intermediario que nao entregava valor de produto. A rota so faz sentido quando ja pode listar eventos e operar CRUD de ponta a ponta.

## O que fazer
Entregar a rota `/agenda` completa no frontend, com item de navegacao, estrutura do modulo `agenda`, leitura por intervalo, refresh manual e formularios de create, edit e delete.

### Arquivos esperados / impactados
- `frontend/src/app/(pages)/agenda/page.tsx` - criar
- `frontend/src/modules/agenda/` - criar estrutura de components, queries, services, types e utils
- `frontend/src/shared/components/AppNavigation/index.tsx` - modificar
- `frontend/src/shared/components/AppNavigation/index.test.tsx` - modificar
- `frontend/src/modules/agenda/services/agendaService.ts` - criar
- `frontend/src/modules/agenda/queries/` - criar queries e mutations
- `frontend/src/modules/agenda/**/*.test.ts*` - criar

## Criterios de Aceite

- [ ] Existe rota navegavel `/agenda` integrada ao App Router e a navegacao principal
- [ ] A tela lista eventos por intervalo com ordenacao consistente
- [ ] O usuario consegue disparar refresh manual da agenda
- [ ] O usuario consegue criar, editar e excluir eventos consumindo o backend real
- [ ] Estados de loading, empty, error, stale e success existem na rota
- [ ] A UX continua utilizavel quando apenas parte das contas ou calendarios esta disponivel
- [ ] Testes cobrem navegacao, leitura e CRUD no fluxo principal

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
- A pagina e camada de composicao; logica de dados fica em `modules/agenda`.
- O primeiro corte pode assumir visao cronologica, sem obrigar grade visual de calendario.

### Edge Cases
- [ ] Usuario acessa `/agenda` sem conta Google conectada
- [ ] Create em calendario excluido por toggle
- [ ] Refresh manual durante mutation em andamento

## Notas de Implementacao
Este ticket substitui a divisao artificial entre foundation e implementacao da rota.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
