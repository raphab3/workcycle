# [T014] Integrar Weekly no frontend com dados híbridos

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-05  
> **Depende de:** T013 | **Bloqueia:** T015  
> **Assignee:** Copilot | **Status:** Concluído

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

- [x] A tela semanal consome backend para semana atual e histórico conforme o modelo híbrido aprovado
- [x] A UI distingue dado provisório e dado fechado
- [x] O formato retornado pela API é mapeado para os tipos da grade semanal sem perda relevante
- [x] Estados de loading, error e empty estão cobertos
- [x] Testes de hooks e da workspace foram adicionados ou atualizados
- [x] Sem regressão nos testes existentes

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
- [x] Histórico vazio para usuário novo
- [x] Semana atual recalculada após fechar o dia
- [x] API retornando linhas de projeto não existentes no cache local

## Notas de Implementação
- Foram criados os contratos frontend de Weekly em `types/weekly.ts`, incluindo `WeeklySnapshotDTO`, `WeeklyHistoryDTO` e metadados de origem (`source`, `isFinal`, `weekKey`, `weekStartsAt`, `weekEndsAt`, `timezone`).
- A camada de integração agora passa por `weeklyService`, `weeklyKeys`, `useWeeklySnapshotQuery` e `useWeeklyHistoryQuery`, mantendo o fluxo padrão `component -> query hook -> service -> axios -> API` adotado no frontend.
- `WeeklyBalanceWorkspace` passou a consumir snapshot atual e histórico persistido quando a sessão autenticada estiver ativa, preservando fallback local apenas para uso sem autenticação ou enquanto a hidratação da sessão ainda não terminou.
- A UI agora explicita o contrato híbrido com notices de autenticação, sincronização, erro e diferenciação entre semana aberta provisória e histórico fechado persistido.
- As células provisórias da semana aberta são marcadas visualmente e o histórico recente exibe semanas fechadas retornadas pelo backend sem depender do cache local de projetos.
- Os testes foram atualizados para cobrir a composição da rota, o fluxo autenticado da workspace e os hooks de query de snapshot/histórico.

## Validação
- `runTests` no frontend para `WeeklyBalanceWorkspace`, `weeklyQueries.test.tsx` e rota `/semana`: suíte verde após adaptar os testes ao `QueryClientProvider` e ao fluxo autenticado.
- `pnpm eslint` focado nos arquivos de Weekly e na rota `/semana`: sem erros; apenas aviso de engine por `node v24.13.0` versus `24.14.0` exigido no `package.json`.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
