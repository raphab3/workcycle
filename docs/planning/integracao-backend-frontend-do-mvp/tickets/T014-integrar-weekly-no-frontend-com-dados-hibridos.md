# [T014] Integrar Weekly no frontend com dados híbridos

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-05  
> **Depende de:** T013 | **Bloqueia:** T015  
> **Assignee:** — | **Status:** Backlog

## Contexto
Weekly hoje depende de cálculo local. O MVP integrado precisa usar backend para histórico confiável e manter regra clara para dados provisórios da semana corrente.

## O que fazer
Criar services e query hooks de Weekly no frontend e adaptar `WeeklyBalanceWorkspace` para consumir backend híbrido, distinguindo dados provisórios e dados fechados.

### Arquivos esperados / impactados
- `frontend/src/modules/weekly/services/weeklyService.ts` — criar
- `frontend/src/modules/weekly/queries/weeklyKeys.ts` — criar
- `frontend/src/modules/weekly/queries/useWeeklySnapshotQuery.ts` — criar
- `frontend/src/modules/weekly/queries/useWeeklyHistoryQuery.ts` — criar
- `frontend/src/modules/weekly/components/WeeklyBalanceWorkspace/index.tsx` — modificar

## Critérios de Aceite

- [ ] A tela semanal consome backend para semana atual e histórico conforme o modelo híbrido aprovado
- [ ] A UI distingue dado provisório e dado fechado
- [ ] O formato retornado pela API é mapeado para os tipos da grade semanal sem perda relevante
- [ ] Estados de loading, error e empty estão cobertos
- [ ] Testes de hooks e da workspace foram adicionados ou atualizados
- [ ] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface WeeklyHistoryQueryInput {
  fromWeekKey?: string;
  toWeekKey?: string;
}
```

### Regras de Negócio
- A semana atual pode continuar parcialmente provisória enquanto houver sessão aberta.

### Edge Cases
- [ ] Histórico vazio para usuário novo
- [ ] Semana atual recalculada após fechar o dia
- [ ] API retornando linhas de projeto não existentes no cache local

## Notas de Implementação
Manter a lógica de interpretação de status semanal concentrada em mapeamento ou utilitário de domínio, não espalhada pela tela.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
