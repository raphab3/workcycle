# [T009] Criar area de notificacoes em Settings com teste e preview

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-05
> **Depende de:** T002, T003, T004 | **Bloqueia:** T011
> **Assignee:** - | **Status:** Backlog

## Contexto
O epic exige uma area explicita de notificacoes operacionais separada da area atual de conta e autenticacao Google. Essa tela tambem precisa explicar o estado degradado do ambiente e oferecer teste e preview para o usuario validar a configuracao.

## O que fazer
Implementar a nova secao de notificacoes em Settings, separando composicao de auth/Google, incluindo formulario de preferencias, status de permissao/capacidade, estado degradado, acao de teste e preview. O historico curto fica conectado em T010.

### Arquivos esperados / impactados
- `frontend/src/modules/settings/components/NotificationsSettingsWorkspace/index.tsx` - criar
- `frontend/src/modules/settings/components/NotificationsSettingsWorkspace/styles.ts` - criar se o padrao local exigir
- `frontend/src/modules/settings/components/AuthSettingsWorkspace/index.tsx` - adaptar composicao se necessario
- `frontend/src/app/(pages)/configuracoes/page.tsx` - modificar
- `frontend/src/modules/settings/**/*.test.tsx` - criar/atualizar

## Criterios de Aceite

- [ ] A pagina de configuracoes exibe uma area de notificacoes separada da area de conta/Google.
- [ ] O usuario consegue visualizar e editar `notificationsEnabled`, `dailyReviewTime` e `timezone` nessa area.
- [ ] A UI mostra permissao atual do navegador, suporte do ambiente e motivo de degradacao quando houver.
- [ ] A UI oferece acao de teste e preview coerentes com o estado real do ambiente.
- [ ] Testes cobrem renderizacao, estados vazio/erro/degradado e submissao basica.

## Detalhes Tecnicos

### Contrato / Interface
```typescript
export interface NotificationsSettingsViewModel {
  notificationsEnabled: boolean;
  timezone: string;
  dailyReviewTime: string;
  permission: 'default' | 'granted' | 'denied' | 'unsupported';
  degradedReason: string | null;
}
```

### Regras de Negocio
- A area de notificacoes nao deve absorver responsabilidades de conta/autenticacao.
- Teste e preview devem respeitar a politica atual do motor de entrega.
- O historico do MVP continua previsto, mas sua exibicao entra no escopo de T010.

### Edge Cases
- [ ] Browser sem suporte a Notification API.
- [ ] Permissao negada com produto habilitado.
- [ ] Falha ao salvar preferencias enquanto a permissao local continua disponivel.

## Notas de Implementacao
Preservar o padrao atual da pagina de configuracoes, mas separar claramente os dominios. Se houver necessidade de composicao, a pagina deve orquestrar workspaces diferentes em vez de concentrar tudo em `AuthSettingsWorkspace`.

Este ticket foi reduzido para manter coesao de UI e composicao. Se o historico curto for puxado para ca, o tamanho volta a L e a dependencia de T010 precisa ser incorporada.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Notificacoes Operacionais do WorkCycle*