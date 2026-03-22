# [T005] Modelar persistência de Tasks e vínculo com ciclo

> **Tipo:** DATA | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T001, T004 | **Bloqueia:** T006, T010  
> **Assignee:** — | **Status:** Backlog

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

- [ ] Existe schema persistido para tasks com vínculo a usuário e projeto
- [ ] Checklist faz parte do modelo persistido ou possui estrutura persistida associada
- [ ] O vínculo da task com ciclo diário concreto está modelado explicitamente
- [ ] O board respeita colunas fixas e ordem fixa no modelo aprovado
- [ ] Migration sobe em ambiente local sem conflito com schemas existentes
- [ ] Testes ou validações estruturais do schema foram adicionados

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
- [ ] Task sem projeto válido
- [ ] Checklist vazio ou ausente
- [ ] Task removida de um ciclo diário existente

## Notas de Implementação
Se checklist precisar de tabela própria, deixar a separação explícita já nesta fase.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
