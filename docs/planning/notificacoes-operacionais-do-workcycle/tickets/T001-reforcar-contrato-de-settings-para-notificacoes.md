# [T001] Reforcar contrato de Settings para notificacoes operacionais

> **Tipo:** API | **Tamanho:** S (2pts) | **Fluxo:** CF-01
> **Depende de:** - | **Bloqueia:** T002, T007, T009
> **Assignee:** - | **Status:** Backlog

## Contexto
O backend de Settings ja expoe `notificationsEnabled`, `dailyReviewTime`, `timezone` e `cycleStartHour`, mas o recorte de notificacoes precisa de um contrato explicito que deixe claro o que e persistido no servidor e o que permanece como estado local do navegador. Esse ticket ancora o restante do epic no contrato minimo correto.

## O que fazer
Revisar e endurecer o contrato de `GET /settings` e `PATCH /settings`, mantendo apenas preferencias persistidas do produto no DTO publico e deixando explicito que permissao, suporte e foco do navegador nao sao campos persistidos.

### Arquivos esperados / impactados
- `backend/src/modules/settings/types/settings.ts` - modificar
- `backend/src/modules/settings/settings.schemas.ts` - modificar se necessario
- `backend/src/modules/settings/controllers/settings.controller.ts` - revisar sem ampliar escopo
- `backend/src/modules/settings/**/*.spec.ts` - atualizar

## Criterios de Aceite

- [ ] `GET /settings` retorna `cycleStartHour`, `dailyReviewTime`, `notificationsEnabled`, `timezone` e `googleConnection` sem campos locais de browser.
- [ ] `PATCH /settings` aceita atualizacao parcial apenas para preferencias persistidas.
- [ ] Timezone invalido e horarios fora de `HH:mm` continuam rejeitados.
- [ ] Update vazio continua rejeitado.
- [ ] Testes backend cobrem payload valido, payload invalido e ausencia de campos nao persistidos.

## Detalhes Tecnicos

### Contrato / Interface
```typescript
export interface UserSettingsDTO {
  cycleStartHour: string;
  dailyReviewTime: string;
  googleConnection: GoogleConnectionSummaryDTO;
  notificationsEnabled: boolean;
  timezone: string;
}

export type UpdateUserSettingsInput = Partial<Pick<UserSettingsDTO, 'cycleStartHour' | 'dailyReviewTime' | 'notificationsEnabled' | 'timezone'>>;
```

### Regras de Negocio
- Permissao do navegador nao e preferencia persistida.
- Suporte a Notification API nao e persistido no backend.
- O contrato deve continuar compativel com o frontend atual de Settings.

### Edge Cases
- [ ] `PATCH` com corpo vazio deve falhar de forma previsivel.
- [ ] `PATCH` com timezone nao IANA deve falhar.
- [ ] `PATCH` com `dailyReviewTime` ou `cycleStartHour` invalidos deve falhar.

## Notas de Implementacao
Nao criar novas colunas nem novo modulo backend neste ticket. O objetivo e consolidar o contrato existente e sua cobertura de testes.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Notificacoes Operacionais do WorkCycle*