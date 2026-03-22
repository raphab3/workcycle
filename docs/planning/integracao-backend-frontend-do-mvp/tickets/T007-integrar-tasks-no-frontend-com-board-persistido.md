# [T007] Integrar Tasks no frontend com board persistido

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T002, T006 | **Bloqueia:** T012, T013, T015  
> **Assignee:** — | **Status:** Backlog

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

- [ ] `TasksWorkspace` usa dados do servidor no fluxo principal
- [ ] CRUD, mudança de status e arquivamento funcionam com backend real
- [ ] Checklist e vínculo com projeto são preservados no mapeamento de tipos
- [ ] A UI trata loading, empty, error e refetch
- [ ] O store local deixa de ser source of truth para o CRUD principal
- [ ] Testes de service, hooks e workspace foram adicionados ou atualizados
- [ ] Sem regressão nos testes existentes

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
- [ ] Mover task entre colunas com falha de rede
- [ ] Criar task sem projeto selecionado quando o backend exigir projeto
- [ ] Recarregar a página após edição de checklist

## Notas de Implementação
Evitar mistura de React Query com duplicação desnecessária de estado em store local.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
