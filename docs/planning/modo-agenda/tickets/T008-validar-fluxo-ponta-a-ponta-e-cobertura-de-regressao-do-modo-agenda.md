# [T008] Validar fluxo ponta a ponta e cobertura de regressao do Modo Agenda

> **Tipo:** TEST | **Tamanho:** L (5pts) | **Fluxo:** CF-01, CF-02, CF-03, CF-04, CF-05, CF-06  
> **Depende de:** T001, T004, T005, T006, T007 | **Bloqueia:** -  
> **Assignee:** - | **Status:** Backlog

## Contexto
O sucesso do epic nao e apenas tecnico. O produto precisa provar que Integracoes, `/agenda`, widgets, accounting e ciclo operam juntos sem regressao visivel e sem obrigar o usuario a sair para o Google Calendar a cada ajuste do dia.

## O que fazer
Executar e complementar a validacao manual e automatizada do fluxo ponta a ponta do Modo Agenda, cobrindo integracoes multi-conta, CRUD, widgets, decisoes operacionais e desconto no ciclo.

### Arquivos esperados / impactados
- `frontend/src/modules/agenda/**/*.test.ts*` - modificar ou criar
- `frontend/src/modules/auth/**/*.test.ts*` - modificar se necessario
- `frontend/src/modules/today/**/*.test.ts*` - modificar se necessario
- `frontend/src/modules/weekly/**/*.test.ts*` - modificar se necessario
- `backend/src/modules/accounts/**/*.spec.ts` - criar ou modificar se necessario
- `backend/src/modules/events/**/*.spec.ts` - criar ou modificar se necessario
- `backend/src/modules/accounting/**/*.spec.ts` - criar ou modificar se necessario
- `backend/src/modules/cycle/**/*.spec.ts` - criar ou modificar se necessario

## Criterios de Aceite

- [ ] Existe validacao manual documentada para Integracoes, `/agenda`, widget em `/hoje`, widget em `/semana`, accounting e impacto no ciclo
- [ ] CRUD em `/agenda` reflete corretamente no Google Calendar no fluxo principal
- [ ] Multiplas contas operam de forma independente no caminho feliz e em falha parcial
- [ ] Eventos silenciados deixam de gerar ruido operacional em leituras futuras
- [ ] Reunioes aprovadas descontam horas disponiveis do ciclo sem duplicidade
- [ ] Testes criticos foram adicionados ou atualizados nos modulos alterados
- [ ] Sem regressao visivel em navegacao, auth Google e telas atuais do produto

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface AgendaEpicValidationChecklist {
  integrations: boolean;
  agendaRoute: boolean;
  todayWidget: boolean;
  weeklyWidget: boolean;
  accounting: boolean;
  cycleImpact: boolean;
}
```

### Regras de Negocio
- O epic so pode ser considerado fechado quando a cadeia `accounts -> events -> accounting -> cycle` estiver validada no caminho principal.

### Edge Cases
- [ ] Refresh apos mutation critica na `/agenda`
- [ ] Conta expirada coexistindo com outra funcional
- [ ] Evento aprovado alterado externamente antes do reload do ciclo

## Notas de Implementacao
Executar este ticket apenas ao final da cadeia principal. Cobertura isolada de unit tests nao substitui a validacao funcional ponta a ponta.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*