# [T004] Migrar Projects para integração completa

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-02  
> **Depende de:** T002, T003 | **Bloqueia:** T005, T015  
> **Assignee:** — | **Status:** Backlog

## Contexto
Projects é o primeiro domínio persistido ponta a ponta e estabelece o padrão de integração para o restante do MVP. A tela precisa operar com React Query e backend real no fluxo principal, sem fallback funcional para mock local.

## O que fazer
Concluir a integração do módulo de Projects no frontend, garantindo que a tela principal use queries e mutations reais com invalidação de cache, tratamento de loading/error/empty/success e testes atualizados.

### Arquivos esperados / impactados
- `frontend/src/modules/projects/services/projectsService.ts` — revisar ou modificar
- `frontend/src/modules/projects/queries/projectKeys.ts` — revisar ou modificar
- `frontend/src/modules/projects/queries/useProjectsQuery.ts` — revisar ou modificar
- `frontend/src/modules/projects/queries/useCreateProjectMutation.ts` — revisar ou modificar
- `frontend/src/modules/projects/queries/useUpdateProjectMutation.ts` — revisar ou modificar
- `frontend/src/modules/projects/queries/useToggleProjectStatusMutation.ts` — revisar ou modificar
- `frontend/src/modules/projects/components/ProjectsWorkspace/index.tsx` — modificar
- `frontend/src/modules/projects/components/ProjectsWorkspace/index.test.tsx` — modificar

## Critérios de Aceite

- [ ] `ProjectsWorkspace` usa backend real no fluxo principal
- [ ] Create, update e toggle de status atualizam a UI sem divergência de cache
- [ ] Estados de loading, empty, error e refetch estão cobertos
- [ ] Não há dependência funcional de mock local na listagem principal
- [ ] Testes do service, hooks e workspace foram atualizados
- [ ] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
type ProjectsQueryResult = ProjectResponseDTO[];
```

### Regras de Negócio
- A tela precisa refletir a consistência da carteira semanal a partir do backend, não só de dados locais.

### Edge Cases
- [ ] Recarregar a página logo após criar um projeto
- [ ] Atualizar projeto com resposta lenta da API
- [ ] Alternar status de projeto em lista já renderizada

## Notas de Implementação
Este ticket fecha o primeiro domínio ponta a ponta e serve como referência para a migração de Tasks.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
