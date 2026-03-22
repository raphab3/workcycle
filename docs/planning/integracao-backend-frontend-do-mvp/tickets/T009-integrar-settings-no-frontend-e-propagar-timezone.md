# [T009] Integrar Settings no frontend e propagar timezone

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-06  
> **Depende de:** T002, T008 | **Bloqueia:** T012, T013, T015  
> **Assignee:** — | **Status:** Backlog

## Contexto
AuthSettingsWorkspace já exibe dados de sessão, mas ainda não representa o conjunto de preferências operacionais persistidas do MVP. Essa integração é necessária para que Today e Weekly usem timezone e horários base coerentes.

## O que fazer
Criar service, query hooks e mutation de Settings no frontend e adaptar `AuthSettingsWorkspace` para leitura e atualização das preferências persistidas.

### Arquivos esperados / impactados
- `frontend/src/modules/auth/services/settingsService.ts` — criar
- `frontend/src/modules/auth/queries/settingsKeys.ts` — criar
- `frontend/src/modules/auth/queries/useUserSettingsQuery.ts` — criar
- `frontend/src/modules/auth/queries/useUpdateUserSettingsMutation.ts` — criar
- `frontend/src/modules/auth/components/AuthSettingsWorkspace/index.tsx` — modificar

## Critérios de Aceite

- [ ] A tela de configurações carrega preferências persistidas do backend
- [ ] O usuário consegue atualizar timezone, notifications enabled, daily review time e cycle start hour
- [ ] A mudança de timezone afeta corretamente regras que dependem disso no frontend compartilhado
- [ ] Cache de settings é previsível e não entra em conflito com cache de sessão
- [ ] Testes de hooks e formulário foram adicionados ou atualizados
- [ ] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
type UpdateUserSettingsInput = Partial<UserSettingsDTO>;
```

### Regras de Negócio
- Settings deve ser carregado cedo o suficiente para sustentar Today e Weekly.

### Edge Cases
- [ ] Recarregar após alterar timezone
- [ ] Falha ao salvar preferências com sessão ainda válida
- [ ] Sessão disponível sem payload de settings inicial

## Notas de Implementação
Manter a resolução de settings fora dos componentes de Today e Weekly sempre que possível.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
