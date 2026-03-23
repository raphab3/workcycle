# [T003] Mapear capacidades do navegador e estado operacional de notificacoes

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-02
> **Depende de:** T002 | **Bloqueia:** T004, T009
> **Assignee:** - | **Status:** Backlog

## Contexto
Para o produto nao confundir preferencia do usuario com capacidade real do ambiente, Notifications precisa conhecer permissao do navegador, suporte a API, foco e visibilidade da pagina em um estado consolidado client-side.

## O que fazer
Implementar a camada client-only que le capacidades do navegador e publica um estado operacional reutilizavel por Settings UI e pelo motor de entrega.

### Arquivos esperados / impactados
- `frontend/src/modules/notifications/services/browserNotificationCapability.ts` - criar
- `frontend/src/modules/notifications/hooks/useNotificationCapability.ts` - criar
- `frontend/src/modules/notifications/store/useNotificationCapabilityStore.ts` - criar ou equivalente leve
- `frontend/src/modules/notifications/types/capability.ts` - criar
- `frontend/src/modules/notifications/**/*.test.ts` - criar

## Criterios de Aceite

- [ ] O estado diferencia `notificationsEnabled` do produto de permissao real do navegador.
- [ ] O estado identifica `granted`, `default`, `denied` e `unsupported`.
- [ ] Foco e visibilidade da pagina sao observados e atualizados sem depender do Today.
- [ ] O estado se recompõe ao retomar foco ou visibilidade da aba.
- [ ] Testes cobrem ambiente suportado, ambiente sem suporte e mudanca de permissao.

## Detalhes Tecnicos

### Contrato / Interface
```typescript
export interface NotificationCapabilityState {
  permission: 'default' | 'granted' | 'denied' | 'unsupported';
  productEnabled: boolean;
  supportsBrowserNotification: boolean;
  visibilityState: DocumentVisibilityState;
  windowFocused: boolean;
}
```

### Regras de Negocio
- Esse estado e somente client-side.
- SSR deve cair em valores seguros e sem acesso a `window` ou `Notification`.
- Mudancas externas de permissao devem ser refletidas na volta de foco.

### Edge Cases
- [ ] Browser sem `Notification` global.
- [ ] Aba volta do background com permissao alterada fora do app.
- [ ] Render inicial em ambiente SSR/hidratacao.

## Notas de Implementacao
Evitar acoplamento com componentes de tela. O objetivo e publicar um estado reutilizavel e previsivel para o modulo de Notifications.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Notificacoes Operacionais do WorkCycle*