# [T005] Modelar persistência de Tasks e vínculo com ciclo

> **Tipo:** DATA | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T001, T004 | **Bloqueia:** T006, T010  
> **Assignee:** GitHub Copilot | **Status:** Concluído

## Contexto
Tasks ainda não existe como domínio persistido no backend, mas é dependência direta para Today e Weekly. O modelo precisa nascer já cobrindo checklist, vínculo com projeto, board com colunas fixas e vínculo da task a um ciclo diário concreto.

## O que fazer
Criar a fundação de dados de Tasks no backend, incluindo schema Drizzle, migration, tipos centrais e modelagem do vínculo com o ciclo diário.

### Arquivos esperados / impactados
- `backend/src/shared/database/schema/tasks.schema.ts` — criar
- `backend/src/shared/database/schema/index.ts` — modificar
- `backend/src/shared/database/migrations/*` — criar
- `backend/src/modules/tasks/` — criar estrutura inicial do módulo

## Critérios de Aceite

- [x] Existe schema persistido para tasks com vínculo a usuário e projeto
- [x] Checklist faz parte do modelo persistido ou possui estrutura persistida associada
- [x] O vínculo da task com ciclo diário concreto está modelado explicitamente
- [x] O board respeita colunas fixas e ordem fixa no modelo aprovado
- [x] Migration sobe em ambiente local sem conflito com schemas existentes
- [x] Testes ou validações estruturais do schema foram adicionados

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface TaskRecordDTO {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  description: string | null;
  status: 'backlog' | 'current' | 'done';
  priority: 'low' | 'medium' | 'high';
  cycleSessionId: string | null;
}
```

### Regras de Negócio
- A modelagem deve sustentar Today e Weekly sem remendo posterior.
- Colunas customizáveis estão fora do escopo do MVP.

### Edge Cases
- [x] Task sem projeto válido
- [x] Checklist vazio ou ausente
- [x] Task removida de um ciclo diário existente

## Notas de Implementação
Se checklist precisar de tabela própria, deixar a separação explícita já nesta fase.

## Execução
- Foi criado o schema `tasks.schema.ts` com três estruturas persistidas: `tasks`, `task_checklist_items` e `cycle_sessions`.
- `tasks` passou a vincular explicitamente `userId`, `projectId` e `cycleSessionId`, além de persistir `columnId`, `status`, `cycleAssignment`, `priority`, `estimatedHours`, `dueDate` e `isArchived`.
- `task_checklist_items` ficou em tabela própria com `position` e `isDone`, deixando a checklist persistida e ordenável desde a base.
- `cycle_sessions` entrou como sessão diária mínima concreta, com `cycleDate`, `state`, `activeProjectId`, `startedAt` e `closedAt`, suficiente para o vínculo de Today ser explícito já no T005.
- O board foi fixado no backend por meio de enums e constantes centrais com a ordem `backlog -> in-progress -> code-review -> done`, alinhando persistência e contrato do frontend atual.
- Também foi criada a estrutura inicial de módulo em `backend/src/modules/tasks/`, com repository, finder, writer e tipos centrais, para o T006 partir de uma fundação já compilável.

## Decisões Estruturais
- `projectId` é obrigatório e protegido por FK com `ON DELETE CASCADE`, cobrindo o edge case de task sem projeto válido no nível de persistência.
- A remoção de uma task de um ciclo diário é modelada por `cycleSessionId` anulável com `ON DELETE SET NULL`, sem apagar a task principal.
- Checklist vazia é suportada naturalmente: a task pode existir sem linhas em `task_checklist_items`.
- O estado da sessão diária já nasce compatível com o contrato planejado de Today: `idle`, `running`, `paused_manual`, `paused_inactivity` e `completed`.

## Validação
- `pnpm db:generate`
- `pnpm test`
- `pnpm build`
- `pnpm eslint src/app.module.ts src/shared/database/schema/index.ts src/shared/database/schema/tasks.schema.ts src/shared/database/schema/tasks.schema.spec.ts src/modules/tasks/tasks.module.ts src/modules/tasks/repositories/tasks.repository.ts src/modules/tasks/services/tasks-finder.service.ts src/modules/tasks/services/tasks-writer.service.ts src/modules/tasks/types/task.ts src/modules/tasks/types/task.spec.ts`

## Checkpoint
- Ticket concluído em 2026-03-22.
- Próximo ticket sugerido: T006 — Implementar API e regras de Tasks.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
