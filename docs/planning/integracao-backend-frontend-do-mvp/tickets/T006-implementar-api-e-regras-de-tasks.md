# [T006] Implementar API e regras de Tasks

> **Tipo:** API | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T005 | **Bloqueia:** T007, T013  
> **Assignee:** — | **Status:** Backlog

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

- [ ] Existem endpoints `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`, `PATCH /tasks/:id/status` e `PATCH /tasks/:id/archive`
- [ ] Operações são filtradas por usuário autenticado
- [ ] Vínculo com projeto e com ciclo diário é validado no backend
- [ ] Checklist e estado do board são persistidos corretamente
- [ ] Regras de leitura/escrita estão separadas de controller
- [ ] Testes unitários de repository e serviços foram adicionados
- [ ] Sem regressão nos testes existentes

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
- [ ] Task inexistente
- [ ] Task arquivada tentando voltar ao board sem regra explícita
- [ ] Vínculo com ciclo diário inválido

## Notas de Implementação
Definir com clareza se o board usa enum de status único ou combinação de status e flags operacionais.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
