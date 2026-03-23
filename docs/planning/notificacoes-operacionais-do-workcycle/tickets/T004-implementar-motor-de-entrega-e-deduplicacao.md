# [T004] Implementar motor de entrega e deduplicacao de notificacoes

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-02
> **Depende de:** T002, T003 | **Bloqueia:** T005, T007, T009, T010
> **Assignee:** - | **Status:** Backlog

## Contexto
O coracao do epic e a politica que decide quando usar notificacao in-app, quando usar Notification API, quando suprimir e quando marcar recovery. Sem essa camada, cada fluxo tenderia a implementar regras locais inconsistentes.

## O que fazer
Criar o motor de entrega de notificacoes operacionais no frontend com entradas tipadas de evento, decisao de canal, deduplicacao por chave estavel, supressao de repeticao e exposicao de estado degradado para a UI.

### Arquivos esperados / impactados
- `frontend/src/modules/notifications/services/notificationDeliveryEngine.ts` - criar
- `frontend/src/modules/notifications/services/notificationDedupeStore.ts` - criar
- `frontend/src/modules/notifications/store/useNotificationsStore.ts` - criar
- `frontend/src/modules/notifications/types/events.ts` - criar
- `frontend/src/modules/notifications/types/delivery.ts` - criar
- `frontend/src/modules/notifications/**/*.test.ts` - criar

## Criterios de Aceite

- [ ] Todo evento operacional entra por uma interface unica do motor de entrega.
- [ ] A aba visivel prioriza canal in-app.
- [ ] Notification API so e usada quando o produto esta habilitado, a permissao esta `granted` e a politica decidir que faz sentido.
- [ ] Eventos duplicados sao suprimidos por chave estavel e janela curta de deduplicacao.
- [ ] O motor expoe motivo de degradacao quando a entrega nao puder ser feita como planejado.
- [ ] O ticket nao introduz persistencia local, multiaba nem recovery; esses recortes permanecem para T008 e T010.
- [ ] Testes unitarios cobrem deduplicacao, selecao de canal, supressao e falha segura.

## Detalhes Tecnicos

### Contrato / Interface
```typescript
export type OperationalNotificationEventType =
  | 'activity-pulse-due'
  | 'activity-pulse-expired'
  | 'daily-review-due'
  | 'recovery-pending';

export interface OperationalNotificationEvent {
  eventId: string;
  type: OperationalNotificationEventType;
  occurredAt: string;
  expiresAt?: string;
  context?: Record<string, string | number | boolean | null>;
}

export interface DeliveryDecision {
  channel: 'in-app' | 'browser' | 'suppressed' | 'recovery';
  reason: string;
}
```

### Regras de Negocio
- O MVP nao toca som proprio do produto.
- A politica precisa ser deterministica para o mesmo evento no mesmo estado.
- Estado degradado deve ser explicavel para o usuario em Settings.
- O escopo desta entrega e runtime em memoria com deduplicacao curta; historico persistido e reconciliacao ficam fora deste ticket.

### Edge Cases
- [ ] Evento repetido apos reload curto.
- [ ] Permissao negada com `notificationsEnabled=true`.
- [ ] Usuario clica em notificacao stale depois que o contexto mudou.

## Notas de Implementacao
Evitar espalhar regras de entrega pelos componentes do Today. O Today emite eventos; o motor de Notifications decide o canal e o destino.

O ticket permanece como L porque combina tipos, engine, facade e testes de dominio em um nucleo coeso. Se persistencia, multiaba ou recovery entrarem neste escopo, ele deve ser quebrado antes da implementacao.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Notificacoes Operacionais do WorkCycle*