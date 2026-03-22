# [T001] Consolidar contrato auth e envelope HTTP

> **Tipo:** API | **Tamanho:** M (3pts) | **Fluxo:** CF-01  
> **Depende de:** — | **Bloqueia:** T002, T003, T008  
> **Assignee:** — | **Status:** Concluído

## Contexto
O MVP integrado depende de um contrato transversal estável para autenticação, recuperação de sessão, renovação de token e tratamento de erros HTTP. Sem isso, cada domínio tende a implementar variações próprias de `401`, `403`, `404` e `500`, gerando inconsistência no frontend e retrabalho nas integrações seguintes.

## O que fazer
Consolidar no backend o contrato oficial de autenticação com Bearer token e refresh token, além de definir o envelope padrão de resposta e erro para os domínios integrados.

### Arquivos esperados / impactados
- `backend/src/modules/auth/controllers/auth.controller.ts` — modificar
- `backend/src/modules/auth/use-cases/get-auth-session.use-case.ts` — modificar
- `backend/src/modules/auth/use-cases/login-user.use-case.ts` — modificar
- `backend/src/modules/auth/types/auth.ts` — modificar
- `backend/src/shared/@types/` — criar ou modificar tipos compartilhados se necessário
- `docs/planning/integracao-backend-frontend-do-mvp/` — referenciar decisões no artefato, se necessário

## Critérios de Aceite

- [x] O contrato oficial do MVP usa Bearer token como mecanismo de autenticação para APIs protegidas
- [x] A política de refresh token está explicitada no backend e refletida no contrato de sessão
- [x] Existe formato padronizado para erros `401`, `403`, `404` e `500`
- [x] O endpoint de sessão autenticada devolve payload consistente para bootstrap do frontend
- [x] Testes unitários ou de contrato cobrem os cenários principais de autenticação
- [x] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface ApiErrorResponseDTO {
  code: string;
  message: string;
  statusCode: number;
}

interface AuthSessionResponseDTO {
  user: {
    id: string;
    email: string;
    displayName: string;
    authProvider: string;
  };
  accessToken?: string;
  refreshToken?: string;
}
```

### Regras de Negócio
- O frontend não deve depender de inferência implícita para saber se a sessão ainda é válida.
- Erros de autenticação precisam ser distinguíveis de erros genéricos de infraestrutura.

### Edge Cases
- [x] Token expirado no backend invalida o Bearer e expõe `accessTokenExpiresAt` no contrato
- [x] Refresh token inválido ou ausente retorna erro padronizado `401`
- [x] Sessão autenticada consultada com bearer inexistente retorna erro padronizado `401`

## Notas de Implementação
Evitar decisões por domínio nesta etapa. Este ticket deve produzir a base comum para Projects, Tasks, Today, Weekly e Settings.

## Execução

### Status final
- Concluído em 2026-03-22
- Base contratual entregue e validada
- Próximo ponto de retomada: `T002 — Ajustar camada HTTP e cache do frontend`

### Entregas realizadas
- Contrato canônico de sessão atualizado para `accessToken`, `refreshToken`, `tokenType`, expiração e política de refresh
- Endpoint `POST /api/auth/refresh` implementado no backend
- Guardas protegidos ajustados para aceitar apenas access token Bearer válido
- Envelope global de erro padronizado para `401`, `403`, `404` e `500`
- Frontend adaptado para persistir e consumir o novo shape de sessão
- Redirect de login Google adaptado para transportar a sessão serializada sem depender do shape legado

### Arquivos efetivamente alterados
- `backend/src/modules/auth/controllers/auth.controller.ts`
- `backend/src/modules/auth/services/auth-finder.service.ts`
- `backend/src/modules/auth/services/auth-writer.service.ts`
- `backend/src/modules/auth/use-cases/get-auth-session.use-case.ts`
- `backend/src/modules/auth/use-cases/login-user.use-case.ts`
- `backend/src/modules/auth/types/auth.ts`
- `backend/src/shared/config/env.ts`
- `backend/src/shared/guards/auth.guard.ts`
- `backend/src/shared/utils/auth-token.ts`
- `backend/src/shared/filters/api-exception.filter.ts`
- `backend/src/shared/types/http.ts`
- `frontend/src/modules/auth/types/auth.ts`
- `frontend/src/modules/auth/services/authService.ts`
- `frontend/src/modules/auth/store/useAuthStore.ts`
- `frontend/src/modules/auth/components/AuthProvider/index.tsx`
- `frontend/src/modules/auth/components/LoginWorkspace/index.tsx`
- `frontend/src/lib/axios.ts`

### Testes e validação executados
- `backend: pnpm test` — ok
- `backend: pnpm build` — ok
- `backend: pnpm lint` — ok
- `frontend: pnpm vitest run src/modules/auth/components/LoginWorkspace/index.test.tsx src/shared/components/AppLayout/index.test.tsx` — ok
- `frontend: pnpm build` — ok
- `frontend: pnpm eslint` nos arquivos alterados — ok

### Observações para retomada
- O contrato de refresh já está disponível, mas a renovação automática no cliente ficou para `T002`
- O lint global do frontend ainda possui pendências pré-existentes fora do escopo deste ticket

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
