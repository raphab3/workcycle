# [T005] Emitir eventos operacionais do Today para Notifications

> **Tipo:** INT | **Tamanho:** M (3pts) | **Fluxo:** CF-03
> **Depende de:** T004 | **Bloqueia:** T006
> **Assignee:** - | **Status:** Backlog

## Contexto
O Today ja concentra o estado de sessao, pulso, expiracao e regularizacao. Esse ticket conecta esse dominio ao motor de Notifications sem mover responsabilidade de negocio de um lado para o outro.

## O que fazer
Criar a adaptacao entre eventos do Today e a interface do motor de Notifications, cobrindo disparo de pulso, resolucao, expiracao e transicoes relevantes de sessao.

### Arquivos esperados / impactados
- `frontend/src/modules/today/hooks/useActivityPulse.ts` - modificar
- `frontend/src/shared/store/useWorkspaceStore.ts` - modificar de forma localizada
- `frontend/src/modules/notifications/adapters/todayNotificationsAdapter.ts` - criar
- `frontend/src/modules/today/**/*.test.ts` - atualizar

## Criterios de Aceite

- [ ] Uma sessao `running` gera evento `activity-pulse-due` quando o pulso abre.
- [ ] Confirmacao ou resolucao do pulso encerra o lembrete pendente correspondente.
- [ ] Expiracao do pulso publica evento compativel com `paused_inactivity`.
- [ ] Pausa manual nao gera notificacao de inatividade por engano.
- [ ] Testes do Today cobrem a emissao de eventos sem regressao do comportamento atual.

## Detalhes Tecnicos

### Contrato / Interface
```typescript
export interface TodayNotificationAdapter {
  emitPulseDue(input: { eventId: string; expiresAt: string; projectId: string | null }): void;
  emitPulseExpired(input: { eventId: string; expiredAt: string }): void;
  emitPulseResolved(input: { eventId: string; resolvedAt: string }): void;
}
```

### Regras de Negocio
- Today continua dono do estado da sessao.
- Notifications nao recalcula expiracao do pulso; apenas consome o evento.
- O adaptador nao deve acoplar o store do Today aos componentes de Settings.

### Edge Cases
- [ ] Reload com pulso ja pendente.
- [ ] Usuario pausa manualmente pouco antes do pulso abrir.
- [ ] Sessao sem projeto ativo valido no momento do evento.

## Notas de Implementacao
Preservar o store do Today como source of truth do fluxo operacional. Este ticket so adiciona emissao de eventos e sincronizacao minima com Notifications.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Notificacoes Operacionais do WorkCycle*