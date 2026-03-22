# [T003] Revisar contratos backend de Projects

> **Tipo:** API | **Tamanho:** S (2pts) | **Fluxo:** CF-02  
> **Depende de:** T001 | **Bloqueia:** T004  
> **Assignee:** — | **Status:** Concluído

## Contexto
Projects já existe no backend e já possui integração parcial no frontend. Antes da migração final da tela, o contrato atual precisa ser revisado para garantir compatibilidade de tipos, payloads, mensagens de erro e resposta das mutations.

## O que fazer
Revisar os endpoints de Projects e estabilizar seus contratos de leitura e escrita para servir como padrão inicial da integração completa.

### Arquivos esperados / impactados
- `backend/src/modules/projects/controllers/projects.controller.ts` — modificar
- `backend/src/modules/projects/projects.schemas.ts` — modificar
- `backend/src/modules/projects/services/projects-finder.service.ts` — revisar
- `backend/src/modules/projects/services/projects-writer.service.ts` — revisar
- `backend/src/modules/projects/repositories/projects.repository.ts` — revisar

## Critérios de Aceite

- [x] `GET /projects` devolve payload compatível com os tipos usados no frontend
- [x] `POST /projects` devolve a entidade persistida
- [x] `PATCH /projects/:id` devolve entidade consistente após atualização parcial
- [x] `PATCH /projects/:id/status` devolve resposta padronizada
- [x] Campos opcionais, validações e erros do domínio estão documentados no código e refletidos nos schemas
- [x] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface ProjectResponseDTO {
  id: string;
  name: string;
  status: 'active' | 'paused';
  allocationPercentage: number;
  colorHex: string;
}
```

### Regras de Negócio
- O contrato de Projects deve ser a referência inicial para os padrões de payload dos demais domínios.

### Edge Cases
- [x] Projeto inexistente para o usuário autenticado continua retornando `404`
- [x] Atualização parcial sem campos efetivos agora falha na validação do schema
- [x] Status inválido no toggle continua bloqueado pelo schema do endpoint

## Notas de Implementação
Este ticket é de revisão e alinhamento, não de criação de novo domínio.

## Execução

### Status final
- Concluído em 2026-03-22
- Contrato backend de Projects estabilizado para servir de base ao T004
- Próximo ponto de retomada: `T004 — Migrar Projects para integração completa`

### Entregas realizadas
- DTO explícito de Projects criado para esconder campos de persistência (`userId`, `createdAt`, `updatedAt`)
- `GET /projects`, `POST /projects`, `PATCH /projects/:id` e `PATCH /projects/:id/status` passaram a responder com payload alinhado ao frontend
- Schema de criação e atualização revisado com validações mais próximas do domínio real do frontend
- Atualização parcial vazia agora é rejeitada explicitamente
- Contrato de enumerações e dias fixos documentado no código via schemas e tipos do módulo
- Guard adicional incluído para falha inesperada de persistência em mutations

### Arquivos efetivamente alterados
- `backend/src/modules/projects/projects.schemas.ts`
- `backend/src/modules/projects/services/projects-finder.service.ts`
- `backend/src/modules/projects/services/projects-writer.service.ts`
- `backend/src/modules/projects/types/project.ts`
- `backend/src/modules/projects/types/project.spec.ts`
- `backend/src/modules/projects/projects.schemas.spec.ts`

### Testes e validação executados
- `backend: pnpm test` — ok
- `backend: pnpm build` — ok
- `backend: pnpm lint` — ok

### Observações para retomada
- O backend de Projects agora expõe o shape canônico esperado pelo frontend atual
- O próximo passo natural é `T004`, que pode migrar a tela de Projects para integração completa sem precisar renegociar payload ou validação de base

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
