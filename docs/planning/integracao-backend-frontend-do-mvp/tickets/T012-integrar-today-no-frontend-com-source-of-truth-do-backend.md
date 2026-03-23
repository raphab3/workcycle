# [T012] Integrar Today no frontend com source of truth do backend

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-04  
> **Depende de:** T007, T009, T011 | **Bloqueia:** T013, T015  
> **Assignee:** Copilot | **Status:** Concluído

## Contexto
Hoje o frontend concentra grande parte da lógica operacional de Today em estado local, utilitários e hooks. O MVP exige que essa tela seja hidratada e persistida pelo backend sem perder a experiência existente.

## O que fazer
Criar services, queries e mutations de Today e adaptar `TodayPlannerOverview` e `useActivityPulse` para operar com backend como source of truth.

### Arquivos esperados / impactados
- `frontend/src/modules/today/services/todayService.ts` — criar
- `frontend/src/modules/today/queries/todayKeys.ts` — criar
- `frontend/src/modules/today/queries/useTodaySessionQuery.ts` — criar
- `frontend/src/modules/today/queries/usePulseRecordsQuery.ts` — criar
- `frontend/src/modules/today/queries/useFirePulseMutation.ts` — criar
- `frontend/src/modules/today/queries/useUpdateTodaySessionMutation.ts` — criar
- `frontend/src/modules/today/components/TodayPlannerOverview/index.tsx` — modificar
- `frontend/src/modules/today/hooks/useActivityPulse.ts` — modificar

## Critérios de Aceite

- [x] Today hidrata estado inicial a partir do backend
- [x] Sessão, pulses, projeto ativo, fechamento e recuperação após reload funcionam com backend real
- [x] O frontend não usa mais estado local como source of truth do fluxo principal de Today
- [x] Loading, empty, error e refetch estão cobertos na experiência do usuário
- [x] O vínculo de task com o ciclo diário concreto é respeitado na UI
- [x] Testes de hooks, services e tela foram adicionados ou atualizados
- [x] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface UpdateTodaySessionInput {
  state?: TodaySessionDTO['state'];
  activeProjectId?: string | null;
}
```

### Regras de Negócio
- Toda projeção visual deve derivar de payload persistido ou de dados derivados explícitos.
- `useActivityPulse` não deve disparar gravações duplicadas.

### Edge Cases
- [x] Recarregar a página com sessão em andamento
- [x] Trocar projeto ativo com sessão já iniciada
- [x] Falha ao registrar pulse durante sessão running

## Notas de Implementação
- A camada Today ganhou `todayService`, query keys e hooks React Query para sessão, pulse records e mutações de sessão/pulse.
- `TodayPlannerOverview` passou a hidratar `projects`, `tasks` e `today session` a partir do backend quando autenticado, mantendo fallback local apenas para testes e estados não autenticados.
- O fluxo principal da tela agora persiste início de sessão, pausa, retomada, troca de projeto ativo, confirmação/revisão de pulse, fechamento do dia e rollover via backend.
- `useActivityPulse` agora evita gravações duplicadas com guards locais e aciona `POST /cycle/pulse` e `PATCH /cycle/session` conforme o estado real da sessão.
- O board operacional de Today passou a reutilizar as mutations persistidas de Tasks para mover cards, pular itens para o próximo ciclo e autosalvar edições.

## Validação
- `runTests` nos arquivos de Today e da rota `hoje`: 4 arquivos aprovados.
- `pnpm eslint` nos arquivos alterados de Today: sem erros; apenas warning de engine por `node v24.13.0` versus `24.14.0` esperado no projeto.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
