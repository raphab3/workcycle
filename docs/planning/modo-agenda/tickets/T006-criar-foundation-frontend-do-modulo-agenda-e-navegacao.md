# [T006] Criar foundation frontend do modulo Agenda e navegacao

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-03  
> **Depende de:** T002, T004 | **Bloqueia:** T007, T008  
> **Assignee:** - | **Status:** Backlog

## Contexto
O frontend ainda nao possui rota `/agenda`, item de navegacao ou modulo dedicado para o dominio de agenda. Antes de implementar CRUD e widgets, e necessario criar a fundacao de pagina, service, query keys e composicao de dominio.

## O que fazer
Criar a estrutura base do modulo `agenda` no frontend, adicionar a rota `/agenda` ao App Router e inserir o item Agenda na navegacao principal.

### Arquivos esperados / impactados
- `frontend/src/app/(pages)/agenda/page.tsx` - criar
- `frontend/src/modules/agenda/` - criar estrutura inicial de components, queries, services, types e utils
- `frontend/src/shared/components/AppNavigation/index.tsx` - modificar
- `frontend/src/shared/components/AppNavigation/index.test.tsx` - modificar
- `frontend/src/modules/agenda/services/agendaService.ts` - criar
- `frontend/src/modules/agenda/queries/agendaKeys.ts` - criar
- `frontend/src/modules/agenda/types/` - criar

## Criterios de Aceite

- [ ] Existe rota navegavel `/agenda` integrada ao App Router
- [ ] A navegacao principal exibe o item Agenda com estado ativo consistente
- [ ] O modulo `modules/agenda/` nasce com service, query keys e tipos basicos alinhados ao contrato backend
- [ ] A pagina possui estado inicial de loading, empty e error pronto para evolucao
- [ ] Testes de rota ou navegacao cobrem a presenca do novo item e da pagina
- [ ] Sem regressao na navegacao atual do app

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface AgendaFilters {
  from: string;
  to: string;
  refresh?: boolean;
}
```

### Regras de Negocio
- A pagina deve ser apenas camada de composicao; logica de dados fica em `modules/agenda`.
- Nao introduzir estado global desnecessario para filtros basicos de agenda.

### Edge Cases
- [ ] Usuario acessa `/agenda` sem conta Google conectada
- [ ] Navegacao ativa coincide com subrotas futuras
- [ ] API de eventos retorna degradacao parcial

## Notas de Implementacao
Este ticket deve preparar a base para o primeiro corte da agenda, sem entrar ainda em formularios completos de CRUD.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
