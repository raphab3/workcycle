# [T006] Tratar expiracao de pulso e supressao em pausa por inatividade

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-03
> **Depende de:** T005 | **Bloqueia:** T008, T010, T011
> **Assignee:** - | **Status:** Backlog

## Contexto
Uma das restricoes mais importantes do epic e evitar ruído durante `paused_inactivity`. O produto precisa mostrar que houve perda do pulso e oferecer recuperacao, mas nao pode repetir alerta em loop nem reabrir contexto stale.

## O que fazer
Implementar a politica especifica de expiracao do pulso, supressao enquanto a sessao permanecer em `paused_inactivity` e tratamento seguro de acoes tardias vindas de notificacoes antigas.

### Arquivos esperados / impactados
- `frontend/src/modules/notifications/services/pulseInactivityPolicy.ts` - criar
- `frontend/src/modules/notifications/store/useNotificationsStore.ts` - modificar
- `frontend/src/modules/today/components/TodayPlannerOverview/index.tsx` - adaptar integracao visual se necessario
- `frontend/src/modules/notifications/**/*.test.ts` - criar/atualizar

## Criterios de Aceite

- [ ] Depois que o pulso expira e a sessao vira `paused_inactivity`, novos ciclos previstos nao repetem alerta operacional enquanto o estado persistir.
- [ ] Uma acao tardia de uma notificacao antiga nao reabre o pulso como se estivesse atual.
- [ ] O estado de supressao e limpo quando o usuario retoma ou regulariza a sessao.
- [ ] Historico curto registra expiracao e supressao com contexto minimo.
- [ ] Testes cobrem a entrada, permanencia e saida de `paused_inactivity`.

## Detalhes Tecnicos

### Contrato / Interface
```typescript
export interface PulseInactivityState {
  activeExpiredEventId: string | null;
  suppressFurtherPulseAlerts: boolean;
  suppressedSince: string | null;
}
```

### Regras de Negocio
- Enquanto `paused_inactivity` estiver ativo, o sistema prioriza recuperacao, nao novas tentativas sonoras ou repetitivas.
- Eventos stale devem ser ignorados com seguranca.
- O historico precisa explicar que um alerta foi suprimido por politica, nao por erro silencioso.

### Edge Cases
- [ ] Usuario retorna depois de varios ciclos previstos perdidos.
- [ ] Usuario retoma a sessao em outra aba antes de clicar no alerta antigo.
- [ ] Expiracao acontece enquanto a aba esta em background.

## Notas de Implementacao
Manter essa regra localizada em Notifications. O Today continua apenas expondo o estado real da sessao.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Notificacoes Operacionais do WorkCycle*