# [T007] Integrar Tasks no frontend com board persistido

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T002, T006 | **Bloqueia:** T012, T013, T015  
> **Assignee:** Copilot | **Status:** Concluido

## Contexto
O frontend de Tasks hoje depende fortemente de estado local. Para o MVP integrado, o board precisa operar com backend real, cobrindo criação, edição, movimentação, arquivamento, checklist e vínculo com projeto/ciclo.

## O que fazer
Criar services, query hooks e mutations de Tasks e migrar `TasksWorkspace` para usar persistência real como fluxo principal.

### Arquivos esperados / impactados
- `frontend/src/modules/tasks/services/tasksService.ts` — criar
- `frontend/src/modules/tasks/queries/taskKeys.ts` — criar
- `frontend/src/modules/tasks/queries/useTasksQuery.ts` — criar
- `frontend/src/modules/tasks/queries/useCreateTaskMutation.ts` — criar
- `frontend/src/modules/tasks/queries/useUpdateTaskMutation.ts` — criar
- `frontend/src/modules/tasks/queries/useUpdateTaskStatusMutation.ts` — criar
- `frontend/src/modules/tasks/queries/useArchiveTaskMutation.ts` — criar
- `frontend/src/modules/tasks/components/TasksWorkspace/index.tsx` — modificar
- `frontend/src/modules/tasks/components/TaskForm/index.tsx` — modificar

## Critérios de Aceite

- [x] `TasksWorkspace` usa dados do servidor no fluxo principal
- [x] CRUD, mudança de status e arquivamento funcionam com backend real
- [x] Checklist e vínculo com projeto são preservados no mapeamento de tipos
- [x] A UI trata loading, empty, error e refetch
- [x] O store local deixa de ser source of truth para o CRUD principal
- [x] Testes de service, hooks e workspace foram adicionados ou atualizados
- [x] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface TasksQueryFilters {
  projectId?: string;
  includeArchived?: boolean;
}
```

### Regras de Negócio
- O board mantém colunas fixas e ordem fixa no MVP.
- Atualização otimista só deve ser usada se a reversão for segura; caso contrário, usar refetch controlado.

### Edge Cases
- [x] Mover task entre colunas com falha de rede
- [x] Criar task sem projeto selecionado quando o backend exigir projeto
- [x] Recarregar a página após edição de checklist

## Notas de Implementação
Evitar mistura de React Query com duplicação desnecessária de estado em store local.

## Implementação Realizada

- Criada a camada `tasksService` com mapeamento entre `TaskRecordDTO` persistido e o modelo de tela, incluindo conversão entre `dueDate` e `dueInDays`.
- Criados `taskKeys`, `useTasksQuery`, `useCreateTaskMutation`, `useUpdateTaskMutation`, `useUpdateTaskStatusMutation` e `useArchiveTaskMutation` seguindo o mesmo padrão de cache adotado em Projects.
- `TasksWorkspace` passou a usar React Query como fluxo principal, com estados explícitos de autenticação, loading, refetch, erro e vazio.
- O store local agora funciona apenas como espelho transversal via `replaceTasks`, sem manter o CRUD principal como source of truth.
- O board foi alinhado ao contrato do backend com colunas fixas, remoção de criação/remoção dinâmica de colunas e remoção do delete local.
- O formulário e o menu do card agora bloqueiam o envio de `cycleAssignment = current` quando a task não possui `cycleSessionId` persistido.
- Testes de service, hooks, workspace e rota foram adicionados/atualizados para cobrir o novo fluxo autenticado.

## Restrições Conhecidas

- Criar uma nova task diretamente no `cycle atual` continua bloqueado até o frontend possuir uma source of truth para `cycleSessionId` vinda do domínio Today.

## Validação

- `pnpm test:run src/modules/tasks/services/tasksService.test.ts src/modules/tasks/queries/tasksQueries.test.tsx src/modules/tasks/components/TaskForm/index.test.tsx src/modules/tasks/components/TasksWorkspace/index.test.tsx 'src/app/(pages)/tarefas/page.test.tsx'`
- `pnpm exec eslint src/modules/tasks/services/tasksService.ts src/modules/tasks/services/tasksService.test.ts src/modules/tasks/queries/taskKeys.ts src/modules/tasks/queries/useTasksQuery.ts src/modules/tasks/queries/useCreateTaskMutation.ts src/modules/tasks/queries/useUpdateTaskMutation.ts src/modules/tasks/queries/useUpdateTaskStatusMutation.ts src/modules/tasks/queries/useArchiveTaskMutation.ts src/modules/tasks/queries/tasksQueries.test.tsx src/modules/tasks/components/TaskForm/index.tsx src/modules/tasks/components/TaskForm/types.ts src/modules/tasks/components/TasksList/index.tsx src/modules/tasks/components/TasksList/types.ts src/modules/tasks/components/TasksWorkspace/index.tsx src/modules/tasks/components/TasksWorkspace/index.test.tsx 'src/app/(pages)/tarefas/page.test.tsx' src/modules/tasks/types/index.ts src/modules/tasks/types/task.ts src/modules/tasks/mocks/tasks.ts src/shared/store/useWorkspaceStore.ts`

## Checkpoint

- T007 concluido com Tasks server-first no frontend.
- Proximo gargalo funcional: T012 e T013 ainda dependem de um contrato persistido de Today/Weekly para liberar novas tasks no `cycle atual` com `cycleSessionId` real.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
