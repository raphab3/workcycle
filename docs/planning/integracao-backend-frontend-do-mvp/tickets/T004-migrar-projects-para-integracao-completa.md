# [T004] Migrar Projects para integração completa

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-02  
> **Depende de:** T002, T003 | **Bloqueia:** T005, T015  
> **Assignee:** GitHub Copilot | **Status:** Concluído

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

- [x] `ProjectsWorkspace` usa backend real no fluxo principal
- [x] Create, update e toggle de status atualizam a UI sem divergência de cache
- [x] Estados de loading, empty, error e refetch estão cobertos
- [x] Não há dependência funcional de mock local na listagem principal
- [x] Testes do service, hooks e workspace foram atualizados
- [x] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
type ProjectsQueryResult = ProjectResponseDTO[];
```

### Regras de Negócio
- A tela precisa refletir a consistência da carteira semanal a partir do backend, não só de dados locais.

### Edge Cases
- [x] Recarregar a página logo após criar um projeto
- [x] Atualizar projeto com resposta lenta da API
- [x] Alternar status de projeto em lista já renderizada

## Notas de Implementação
Este ticket fecha o primeiro domínio ponta a ponta e serve como referência para a migração de Tasks.

## Execução
- A fonte principal da listagem passou a ser o backend autenticado via React Query, sem fallback funcional para `mockProjects` na tela principal.
- As mutations de create, update e toggle passaram a reconciliar cache local e invalidar a listagem para evitar divergência após round-trip com a API.
- O workspace sincroniza apenas o espelhamento transversal para outras rotas, preservando Projects como source of truth vinda do backend.
- A UI passou a tratar explicitamente autenticação pendente, ausência de sessão, loading inicial, refetch em andamento, erro de integração e empty state real.
- Os testes foram atualizados em três níveis: service HTTP, hooks de query/mutation e workspace/renderização da tela.
- O teste da rota `projetos` foi reduzido para composição, mantendo a regra arquitetural de página como camada de orquestração.

## Validação
- `pnpm vitest run src/modules/projects/services/projectsService.test.ts src/modules/projects/queries/projectsQueries.test.tsx src/modules/projects/components/ProjectsWorkspace/index.test.tsx src/modules/projects/components/ProjectForm/index.test.tsx 'src/app/(pages)/projetos/page.test.tsx'`
- `pnpm eslint src/modules/projects/queries/projectKeys.ts src/modules/projects/queries/useCreateProjectMutation.ts src/modules/projects/queries/useUpdateProjectMutation.ts src/modules/projects/queries/useToggleProjectStatusMutation.ts src/modules/projects/queries/projectsQueries.test.tsx src/modules/projects/components/ProjectForm/index.tsx src/modules/projects/components/ProjectForm/types.ts src/modules/projects/components/ProjectsWorkspace/index.tsx src/modules/projects/components/ProjectsWorkspace/index.test.tsx src/modules/projects/services/projectsService.test.ts 'src/app/(pages)/projetos/page.test.tsx'`
- `pnpm build`

## Checkpoint
- Ticket concluído em 2026-03-22.
- Próximo ticket sugerido: T005 — Modelar persistência de Tasks e vínculo com ciclo.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
