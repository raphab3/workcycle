# [T015] Validar fluxo ponta a ponta e cobertura de regressão

> **Tipo:** TEST | **Tamanho:** L (5pts) | **Fluxo:** CF-01, CF-02, CF-03, CF-04, CF-05, CF-06  
> **Depende de:** T004, T007, T009, T012, T014 | **Bloqueia:** —  
> **Assignee:** — | **Status:** Backlog

## Contexto
O objetivo do epic não é apenas criar endpoints e hooks, mas fechar o fluxo ponta a ponta do MVP com persistência confiável e sem regressão visível. Este ticket consolida validação manual e cobertura automatizada dos fluxos principais.

## O que fazer
Executar e complementar a cobertura de testes e a validação manual dos domínios integrados, garantindo que o MVP opere com backend real nos caminhos principais.

### Arquivos esperados / impactados
- `frontend/src/modules/projects/**/*.test.ts*` — modificar se necessário
- `frontend/src/modules/tasks/**/*.test.ts*` — modificar se necessário
- `frontend/src/modules/today/**/*.test.ts*` — modificar se necessário
- `frontend/src/modules/weekly/**/*.test.ts*` — modificar se necessário
- `frontend/src/modules/auth/**/*.test.ts*` — modificar se necessário
- `backend/src/modules/**/**/*.spec.ts` — criar ou modificar se necessário

## Critérios de Aceite

- [ ] Existe validação manual documentada para Projects, Tasks, Today, Weekly e Settings
- [ ] Fluxo de login continua funcionando após a integração completa
- [ ] Dados principais sobrevivem a reload e podem ser recuperados de forma consistente
- [ ] Não há dependência funcional de mock local nos fluxos principais dos domínios integrados
- [ ] Testes cobrindo cenários críticos foram adicionados ou atualizados
- [ ] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface EndToEndValidationChecklist {
  projects: boolean;
  tasks: boolean;
  today: boolean;
  weekly: boolean;
  settings: boolean;
}
```

### Regras de Negócio
- Um domínio só pode ser considerado integrado quando o fluxo manual ponta a ponta estiver validado.

### Edge Cases
- [ ] Refresh após mutation crítica
- [ ] Sessão expirada durante fluxo já iniciado
- [ ] Divergência entre dados do dia e visão semanal

## Notas de Implementação
Este ticket fecha o epic e deve ser executado no fim, após os domínios principais estarem conectados.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
