# [T001] Consolidar contrato auth e envelope HTTP

> **Tipo:** API | **Tamanho:** M (3pts) | **Fluxo:** CF-01  
> **Depende de:** — | **Bloqueia:** T002, T003, T008  
> **Assignee:** — | **Status:** Backlog

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

- [ ] O contrato oficial do MVP usa Bearer token como mecanismo de autenticação para APIs protegidas
- [ ] A política de refresh token está explicitada no backend e refletida no contrato de sessão
- [ ] Existe formato padronizado para erros `401`, `403`, `404` e `500`
- [ ] O endpoint de sessão autenticada devolve payload consistente para bootstrap do frontend
- [ ] Testes unitários ou de contrato cobrem os cenários principais de autenticação
- [ ] Sem regressão nos testes existentes

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
- [ ] Token expirado durante navegação autenticada
- [ ] Refresh token inválido ou ausente
- [ ] Sessão autenticada consultada com bearer inexistente

## Notas de Implementação
Evitar decisões por domínio nesta etapa. Este ticket deve produzir a base comum para Projects, Tasks, Today, Weekly e Settings.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
