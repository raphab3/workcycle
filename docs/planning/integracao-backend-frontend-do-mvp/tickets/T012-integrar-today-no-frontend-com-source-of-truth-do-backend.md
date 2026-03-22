# [T012] Integrar Today no frontend com source of truth do backend

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-04  
> **Depende de:** T007, T009, T011 | **Bloqueia:** T013, T015  
> **Assignee:** — | **Status:** Backlog

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

- [ ] Today hidrata estado inicial a partir do backend
- [ ] Sessão, pulses, projeto ativo, fechamento e recuperação após reload funcionam com backend real
- [ ] O frontend não usa mais estado local como source of truth do fluxo principal de Today
- [ ] Loading, empty, error e refetch estão cobertos na experiência do usuário
- [ ] O vínculo de task com o ciclo diário concreto é respeitado na UI
- [ ] Testes de hooks, services e tela foram adicionados ou atualizados
- [ ] Sem regressão nos testes existentes

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
- [ ] Recarregar a página com sessão em andamento
- [ ] Trocar projeto ativo com sessão já iniciada
- [ ] Falha ao registrar pulse durante sessão running

## Notas de Implementação
Reavaliar cuidadosamente cada `useEffect` existente em Today durante a migração.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
