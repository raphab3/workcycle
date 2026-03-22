# [T003] Revisar contratos backend de Projects

> **Tipo:** API | **Tamanho:** S (2pts) | **Fluxo:** CF-02  
> **Depende de:** T001 | **Bloqueia:** T004  
> **Assignee:** — | **Status:** Backlog

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

- [ ] `GET /projects` devolve payload compatível com os tipos usados no frontend
- [ ] `POST /projects` devolve a entidade persistida
- [ ] `PATCH /projects/:id` devolve entidade consistente após atualização parcial
- [ ] `PATCH /projects/:id/status` devolve resposta padronizada
- [ ] Campos opcionais, validações e erros do domínio estão documentados no código e refletidos nos schemas
- [ ] Sem regressão nos testes existentes

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
- [ ] Projeto inexistente para o usuário autenticado
- [ ] Atualização parcial sem campos efetivos
- [ ] Status inválido no toggle

## Notas de Implementação
Este ticket é de revisão e alinhamento, não de criação de novo domínio.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
