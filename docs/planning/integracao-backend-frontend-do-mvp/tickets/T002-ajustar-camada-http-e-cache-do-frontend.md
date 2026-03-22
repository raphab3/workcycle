# [T002] Ajustar camada HTTP e cache do frontend

> **Tipo:** INT | **Tamanho:** M (3pts) | **Fluxo:** CF-01  
> **Depende de:** T001 | **Bloqueia:** T004, T007, T009  
> **Assignee:** — | **Status:** Concluído

## Contexto
O frontend precisa de uma camada HTTP previsível para sustentar o MVP integrado. Hoje Axios e Query Client já existem, mas a política de autenticação, retry, stale time, invalidação e tratamento de erro ainda precisa ser consolidada em torno do contrato oficial definido no backend.

## O que fazer
Ajustar a camada compartilhada do frontend para envio consistente de bearer token, política de refresh, interceptação de erros e defaults do React Query que sirvam de base para os domínios integrados.

### Arquivos esperados / impactados
- `frontend/src/lib/axios.ts` — modificar
- `frontend/src/lib/queryClient.ts` — modificar
- `frontend/src/lib/apiError.ts` — modificar
- `frontend/src/modules/auth/storage/authStorage.ts` — modificar
- `frontend/src/modules/auth/store/useAuthStore.ts` — modificar se necessário

## Critérios de Aceite

- [x] Requisições autenticadas enviam bearer token de forma consistente
- [x] Erros `401`, `403`, `404` e `500` são traduzidos para um fluxo previsível no frontend
- [x] A política de retry e stale time do Query Client está explícita
- [x] O fluxo de refresh token ou logout controlado funciona sem quebrar navegação principal
- [x] Testes da camada HTTP e de autenticação foram atualizados
- [x] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
type AuthFailureMode = 'refresh-and-retry' | 'logout';

interface HttpClientPolicy {
  authFailureMode: AuthFailureMode;
  defaultRetry: number;
  defaultStaleTimeMs: number;
}
```

### Regras de Negócio
- O frontend não pode espalhar lógica de refresh ou logout por hooks de domínio.
- Defaults de cache devem minimizar refetch desnecessário sem esconder mutações recentes.

### Edge Cases
- [x] Múltiplas queries falhando com `401` ao mesmo tempo compartilham o mesmo refresh serializado
- [x] Sessão expirada durante mutation crítica cai em refresh-and-retry antes de logout controlado
- [x] Token ausente em reload inicial da aplicação mantém boot sem sessão inválida e sem envio indevido de bearer

## Notas de Implementação
Manter a responsabilidade na camada compartilhada, não em hooks de Projects, Tasks ou Today.

## Execução

### Status final
- Concluído em 2026-03-22
- Camada HTTP e política de cache consolidadas
- Próximo ponto de retomada: `T003 — Revisar contratos backend de Projects`

### Entregas realizadas
- Interceptor de resposta com política `refresh-and-retry` para `401` e logout controlado em falha de refresh
- Serialização de refresh token para evitar concorrência duplicada em múltiplas falhas simultâneas
- Query Client com defaults explícitos de `retry`, `staleTime`, `gcTime`, `refetchOnWindowFocus` e `refetchOnReconnect`
- Tradução previsível de erros HTTP via normalização compartilhada (`401`, `403`, `404`, `500`)
- Migração transparente de sessão persistida legada (`token`) para o contrato canônico (`accessToken` / `refreshToken`)
- Testes adicionados para camada HTTP, cache, erros e storage de autenticação

### Arquivos efetivamente alterados
- `frontend/src/lib/axios.ts`
- `frontend/src/lib/queryClient.ts`
- `frontend/src/lib/apiError.ts`
- `frontend/src/modules/auth/storage/authStorage.ts`
- `frontend/src/modules/auth/components/LoginWorkspace/index.tsx`
- `frontend/src/shared/types/api.ts`
- `frontend/src/lib/apiError.test.ts`
- `frontend/src/lib/queryClient.test.ts`
- `frontend/src/lib/axios.test.ts`
- `frontend/src/modules/auth/storage/authStorage.test.ts`

### Testes e validação executados
- `frontend: pnpm vitest run src/lib/apiError.test.ts src/lib/queryClient.test.ts src/modules/auth/storage/authStorage.test.ts src/lib/axios.test.ts src/modules/auth/components/LoginWorkspace/index.test.tsx src/shared/components/AppLayout/index.test.tsx` — ok
- `frontend: pnpm eslint` nos arquivos alterados — ok
- `frontend: pnpm build` — ok

### Observações para retomada
- A base compartilhada de autenticação e cache está pronta para os domínios consumirem sem reimplementar refresh, logout ou parsing de erro
- O próximo bloco natural é `T003`, já que `Projects` depende do contrato consolidado em `T001` e da camada HTTP/cache consolidada em `T002`

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
