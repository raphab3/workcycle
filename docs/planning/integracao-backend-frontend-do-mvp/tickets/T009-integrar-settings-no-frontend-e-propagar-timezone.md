# [T009] Integrar Settings no frontend e propagar timezone

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-06  
> **Depende de:** T002, T008 | **Bloqueia:** T012, T013, T015  
> **Assignee:** Copilot | **Status:** Concluído

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

- [x] A tela de configurações carrega preferências persistidas do backend
- [x] O usuário consegue atualizar timezone, notifications enabled, daily review time e cycle start hour
- [x] A mudança de timezone passa a ser hidratada no estado compartilhado do workspace para sustentar consumidores transversais do frontend
- [x] Cache de settings é previsível e não entra em conflito com cache de sessão
- [x] Testes de hooks e formulário foram adicionados ou atualizados
- [x] Sem regressão nos testes executados no escopo alterado

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

## Entrega
- Criados `settingsService`, `settingsKeys`, `useUserSettingsQuery` e `useUpdateUserSettingsMutation` para consumir `GET /api/settings` e `PATCH /api/settings` sem acoplar settings ao cache de sessão autenticada.
- `AuthSettingsWorkspace` agora carrega preferências persistidas, exibe estados de loading/erro/sucesso e salva timezone, notifications, daily review time e cycle start hour via React Hook Form + Zod.
- A seção de Settings também reflete o resumo de vínculo Google retornado pelo backend T008.
- O timezone persistido passou a ser hidratado no estado compartilhado do workspace via provider, preparando o consumo transversal por Today e Weekly sem duplicar leitura de API em cada rota.

## Validação
- `runTests` no escopo:
	- `frontend/src/modules/auth/queries/authQueries.test.tsx`
	- `frontend/src/modules/auth/components/AuthSettingsWorkspace/index.test.tsx`
- Resultado: 4 testes aprovados, 0 falhas.
- `pnpm eslint` nos arquivos alterados do escopo T009: sem erros de lint; apenas aviso de engine local `node v24.13.0` versus `24.14.0` exigido no `package.json`.

## Observações
- A hidratação do timezone compartilhado foi entregue em base de frontend. A consolidação do boundary operacional canônico continua pertencendo aos tickets de Today e Weekly dependentes deste contrato.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
