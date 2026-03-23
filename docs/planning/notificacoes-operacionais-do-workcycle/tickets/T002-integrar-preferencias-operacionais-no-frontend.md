# [T002] Integrar preferencias operacionais no frontend

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-01
> **Depende de:** T001 | **Bloqueia:** T003, T007, T009
> **Assignee:** - | **Status:** Backlog

## Contexto
O frontend ainda nao tem uma fronteira explicita de Settings operacionais consumida por Notifications. Hoje a tela de configuracoes esta concentrada em autenticacao/Google. Esse ticket cria a leitura e escrita canonica das preferencias persistidas para o frontend.

## O que fazer
Criar service, query keys, hooks e mutation para Settings operacionais no frontend, com hidracao previsivel para consumidores como Notifications e Settings UI.

### Arquivos esperados / impactados
- `frontend/src/modules/settings/services/settingsService.ts` - criar
- `frontend/src/modules/settings/queries/settingsKeys.ts` - criar
- `frontend/src/modules/settings/queries/useUserSettingsQuery.ts` - criar
- `frontend/src/modules/settings/queries/useUpdateUserSettingsMutation.ts` - criar
- `frontend/src/modules/settings/types/settings.ts` - criar
- `frontend/src/app/(pages)/configuracoes/page.tsx` - adaptar composicao se necessario

## Criterios de Aceite

- [ ] O frontend busca `GET /settings` com React Query em uma chave dedicada.
- [ ] O frontend envia `PATCH /settings` para `timezone`, `dailyReviewTime`, `notificationsEnabled` e `cycleStartHour`.
- [ ] Consumidores nao acessam o backend de Settings diretamente fora da camada de service/query.
- [ ] Falha de carregamento ou salvamento e tratada sem invalidar a sessao autenticada.
- [ ] Testes de service/hooks cobrem sucesso, erro e invalidacao de cache.

## Detalhes Tecnicos

### Contrato / Interface
```typescript
export interface UserSettingsDTO {
  cycleStartHour: string;
  dailyReviewTime: string;
  notificationsEnabled: boolean;
  timezone: string;
}

export type UpdateUserSettingsInput = Partial<UserSettingsDTO>;
```

### Regras de Negocio
- Settings operacionais devem ser lidos antes de o modulo de Notifications tomar decisoes de entrega.
- Cache de Settings deve ser independente do cache de sessao/auth.
- Today e Notifications consomem dados derivados, nao chamam a API diretamente.

### Edge Cases
- [ ] Sessao autenticada valida sem payload de Settings ja carregado.
- [ ] Reload logo apos trocar timezone.
- [ ] Erro no `PATCH /settings` enquanto a tela continua utilizavel.

## Notas de Implementacao
Seguir o padrao ja usado pelo frontend para services e query hooks. Nao misturar a nova camada com `AuthSettingsWorkspace` alem do necessario para composicao da pagina.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Notificacoes Operacionais do WorkCycle*