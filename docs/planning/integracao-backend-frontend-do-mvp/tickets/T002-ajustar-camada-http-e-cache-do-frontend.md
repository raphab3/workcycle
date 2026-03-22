# [T002] Ajustar camada HTTP e cache do frontend

> **Tipo:** INT | **Tamanho:** M (3pts) | **Fluxo:** CF-01  
> **Depende de:** T001 | **Bloqueia:** T004, T007, T009  
> **Assignee:** — | **Status:** Backlog

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

- [ ] Requisições autenticadas enviam bearer token de forma consistente
- [ ] Erros `401`, `403`, `404` e `500` são traduzidos para um fluxo previsível no frontend
- [ ] A política de retry e stale time do Query Client está explícita
- [ ] O fluxo de refresh token ou logout controlado funciona sem quebrar navegação principal
- [ ] Testes da camada HTTP e de autenticação foram atualizados
- [ ] Sem regressão nos testes existentes

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
- [ ] Múltiplas queries falhando com `401` ao mesmo tempo
- [ ] Sessão expirada durante mutation crítica
- [ ] Token ausente em reload inicial da aplicação

## Notas de Implementação
Manter a responsabilidade na camada compartilhada, não em hooks de Projects, Tasks ou Today.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
