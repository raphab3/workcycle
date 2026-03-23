# [T010] Persistir historico curto e reconciliar reload e multiaba

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-06
> **Depende de:** T004, T006, T008 | **Bloqueia:** T011
> **Assignee:** - | **Status:** Backlog

## Contexto
Sem historico curto persistido e sem reconciliacao minima entre reload e multiplas abas, o produto perde explicabilidade e volta a correr risco de notificacoes duplicadas. Esse ticket fecha o recorte local do MVP sem virar um centro de notificacoes completo.

## O que fazer
Persistir historico curto local de lembretes e implementar reconciliacao best effort para reload e multiaba, com chaves estaveis de evento e leitura pela UI de Settings.

### Arquivos esperados / impactados
- `frontend/src/modules/notifications/services/reminderHistoryStorage.ts` - criar
- `frontend/src/modules/notifications/services/multiTabNotificationSync.ts` - criar
- `frontend/src/modules/notifications/types/history.ts` - criar
- `frontend/src/modules/notifications/store/useNotificationsStore.ts` - modificar
- `frontend/src/modules/notifications/**/*.test.ts` - criar/atualizar

## Criterios de Aceite

- [ ] Lembretes recentes sobrevivem a reload da pagina.
- [ ] Eventos duplicados em abas concorrentes sao suprimidos de forma best effort.
- [ ] Historico curto armazena tipo, timestamp, status resumido e referencia contextual minima.
- [ ] Storage corrompido ou indisponivel e tratado com falha segura sem quebrar a UI.
- [ ] Settings consegue ler o historico curto recente para exibicao.
- [ ] Testes cobrem reload, storage invalido e duplicacao entre abas.

## Detalhes Tecnicos

### Contrato / Interface
```typescript
export interface ReminderHistoryItem {
  eventId: string;
  type: 'activity-pulse-due' | 'activity-pulse-expired' | 'daily-review-due' | 'recovery-pending';
  occurredAt: string;
  status: 'shown' | 'missed' | 'resolved' | 'suppressed';
  contextLabel: string | null;
}
```

### Regras de Negocio
- O objetivo e explicar o que aconteceu recentemente, nao manter trilha auditavel longa.
- Multiaba prioriza evitar duplicacao acima de sincronizacao perfeita.
- Historico antigo pode expirar por politica curta definida na implementacao.

### Edge Cases
- [ ] JSON corrompido no storage local.
- [ ] Mesmo evento entregue por duas abas quase ao mesmo tempo.
- [ ] Usuario limpa storage local durante a sessao.

## Notas de Implementacao
Preferir mecanismos nativos leves como `localStorage` e evento `storage`. So ampliar para outra estrategia se a implementacao mostrar necessidade real.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Notificacoes Operacionais do WorkCycle*