# [T008] Recuperar lembretes pendentes na retomada do app

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-04
> **Depende de:** T006, T007 | **Bloqueia:** T010, T011
> **Assignee:** - | **Status:** Backlog

## Contexto
Como o MVP nao garante entrega com app fechado ou timers ativos em background, a retomada do app precisa ser tratada como fluxo de recovery. Esse ticket transforma eventos perdidos em uma experiencia unica e contextual, em vez de um lote de alertas retroativos.

## O que fazer
Implementar a reconciliacao na retomada do app com base em foco, visibilidade e estado atual da sessao, exibindo apenas pendencias ainda validas de pulso e revisao diaria.

### Arquivos esperados / impactados
- `frontend/src/modules/notifications/services/notificationRecoveryService.ts` - criar
- `frontend/src/modules/notifications/hooks/useNotificationRecovery.ts` - criar
- `frontend/src/modules/notifications/store/useNotificationsStore.ts` - modificar
- `frontend/src/modules/notifications/**/*.test.ts` - criar/atualizar

## Criterios de Aceite

- [ ] Ao retomar o app depois de perder um pulso, o usuario recebe no maximo uma pendencia atualizada e valida.
- [ ] Ao retomar o app depois de perder a revisao diaria, o usuario ve apenas o lembrete pertinente ao dia operacional ainda valido.
- [ ] O sistema nao dispara lote retroativo de notificacoes antigas.
- [ ] Eventos ja resolvidos ou stale sao descartados durante a reconciliacao.
- [ ] Testes cobrem retomada curta, ausencia longa e mudanca de dia operacional.

## Detalhes Tecnicos

### Contrato / Interface
```typescript
export interface RecoveryResolution {
  pendingEventId: string | null;
  resolution: 'none' | 'show-in-app' | 'discard-stale';
  reason: string;
}
```

### Regras de Negocio
- Recovery prioriza contexto atual, nao fidelidade historica total.
- O evento recuperado precisa ser unico e explicavel.
- Se o estado atual da sessao nao sustentar mais o lembrete, o evento deve ser descartado.

### Edge Cases
- [ ] Usuario retorna no dia seguinte.
- [ ] Outro tab ja resolveu o lembrete antes da aba atual ganhar foco.
- [ ] O app retoma com storage local parcialmente desatualizado.

## Notas de Implementacao
Usar os mesmos identificadores estaveis do motor de entrega para nao criar uma segunda fonte de verdade de deduplicacao.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Notificacoes Operacionais do WorkCycle*