# [T006] Implementar API e regras de Tasks

> **Tipo:** API | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T005 | **Bloqueia:** T007, T013  
> **Assignee:** GitHub Copilot | **Status:** Concluído

## Contexto
Com a fundação de dados criada, o backend precisa expor Tasks como domínio completo do MVP, com leitura, escrita, mudança de status, arquivamento e regras do board consistentes com o frontend.

## O que fazer
Implementar o módulo Tasks no backend com repository, services, use cases, controller e validação de payloads.

### Arquivos esperados / impactados
- `backend/src/modules/tasks/tasks.module.ts` — criar
- `backend/src/modules/tasks/controllers/tasks.controller.ts` — criar
- `backend/src/modules/tasks/repositories/tasks.repository.ts` — criar
- `backend/src/modules/tasks/services/tasks-finder.service.ts` — criar
- `backend/src/modules/tasks/services/tasks-writer.service.ts` — criar
- `backend/src/modules/tasks/use-cases/*.ts` — criar
- `backend/src/modules/tasks/tasks.schemas.ts` — criar
- `backend/src/app.module.ts` — modificar

## Critérios de Aceite

- [x] Existem endpoints `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`, `PATCH /tasks/:id/status` e `PATCH /tasks/:id/archive`
- [x] Operações são filtradas por usuário autenticado
- [x] Vínculo com projeto e com ciclo diário é validado no backend
- [x] Checklist e estado do board são persistidos corretamente
- [x] Regras de leitura/escrita estão separadas de controller
- [x] Testes unitários de repository e serviços foram adicionados
- [x] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface UpdateTaskStatusDTO {
  status: 'backlog' | 'current' | 'done';
  cycleSessionId?: string | null;
}
```

### Regras de Negócio
- Uma task não pode ser associada a projeto de outro usuário.
- Arquivamento não deve destruir histórico necessário para Weekly.

### Edge Cases
- [x] Task inexistente
- [x] Task arquivada tentando voltar ao board sem regra explícita
- [x] Vínculo com ciclo diário inválido

## Notas de Implementação
Definir com clareza se o board usa enum de status único ou combinação de status e flags operacionais.

## Execução
- Foi criado o controller `TasksController` com os endpoints autenticados `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`, `PATCH /tasks/:id/status` e `PATCH /tasks/:id/archive`.
- O módulo agora usa `tasks.schemas.ts` para validar payloads de create, update, status update e archive, com regras explícitas para board e ciclo.
- As regras de negócio ficaram encapsuladas em use cases dedicados para listar, criar, atualizar, atualizar estado do board, arquivar e validar contexto de escrita.
- O repository foi expandido para validar projeto do usuário autenticado, validar `cycleSessionId`, persistir checklist ordenada e listar apenas tasks não arquivadas no fluxo principal.
- Finder e writer services foram mantidos como camada intermediária entre controller e use cases, preservando o mesmo padrão já adotado em `projects`.

## Decisões Estruturais
- O board usa combinação explícita de `columnId` fixo + `status` derivado da coluna + `cycleAssignment`; não há coluna customizável no backend do MVP.
- `status` precisa ser consistente com `columnId` no backend: `backlog -> todo`, `in-progress -> doing`, `code-review -> blocked`, `done -> done`.
- Apenas tasks com `cycleAssignment = current` podem carregar `cycleSessionId`, e esse vínculo precisa apontar para uma sessão concreta do mesmo usuário.
- Se a `cycleSession` tiver `activeProjectId`, a task precisa pertencer ao mesmo projeto para evitar acoplamento inválido entre Today e Tasks.
- Task arquivada não volta ao board por update/status sem regra explícita de restore; a API responde conflito nesse cenário.

## Validação
- `pnpm test`
- `pnpm build`
- `pnpm eslint src/modules/tasks/**/*.ts src/app.module.ts`

## Checkpoint
- Ticket concluído em 2026-03-22.
- Próximo ticket sugerido: T007 — Integrar Tasks no frontend com board persistido.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
