# Agentes

Este diretório reúne agentes especializados para planejamento, implementação e revisão no repositório.

## Quando usar cada agente

### PLANNER
- Arquivo: [PLANNER.agent.md](./PLANNER.agent.md)
- Use como launcher do workflow de especificação.
- Ele encaminha para os agentes de fase corretos em vez de concentrar toda a lógica de descoberta, decomposição e tickets no mesmo lugar.
- Quando a continuidade depender de poucas opções objetivas, ele e os agentes de fase devem preferir UI estruturada com `vscode/askQuestions`.

### Epic
- Arquivo: [Epic.agent.md](./Epic.agent.md)
- Use para a Fase 1, quando a iniciativa ainda precisa ser extraída, clarificada e transformada em um EPIC aprovado.
- Faz rodadas curtas com perguntas na UI, rejeita respostas vagas e cria `docs/planning/[epic-slug]/epic.md` após aprovação.
- Para aprovação ou continuidade simples, deve usar seleção única na UI em vez de apenas sugerir passos em texto.

### Core Flow
- Arquivo: [Core-Flow.agent.md](./Core-Flow.agent.md)
- Use para a Fase 2, quando já existir um EPIC aprovado e você precisar decompor a solução em fluxos, módulos e dependências.
- Tem handoff para voltar ao EPIC com feedback ou avançar para tickets.
- Para decidir entre aprovar, voltar ou abrir no editor, deve preferir seleção única na UI.

### Tickets
- Arquivo: [Tickets.agent.md](./Tickets.agent.md)
- Use para a Fase 3, quando já existir um CORE FLOW aprovado e você precisar gerar tickets detalhados e executáveis.
- Tem handoffs para voltar ao CORE FLOW, revisar tickets e iniciar planejamento ou implementação.
- Para próximas ações de continuidade, pode usar seleção única ou múltipla na UI, conforme as ações sejam exclusivas ou combináveis.

### frontend-architect
- Arquivo: [frontend-architect.agent.md](./frontend-architect.agent.md)
- Use quando os tickets ou requisitos já existirem e você precisar decompor a solução frontend antes de implementar.

### frontend-implementer
- Arquivo: [frontend-implementer.agent.md](./frontend-implementer.agent.md)
- Use quando o plano frontend já estiver claro e a próxima etapa for codificar.

### frontend-reviewer
- Arquivo: [frontend-reviewer.agent.md](./frontend-reviewer.agent.md)
- Use para revisar mudanças ou planos frontend em busca de bugs, regressões e violações arquiteturais.

### backend-architect
- Arquivo: [backend-architect.agent.md](./backend-architect.agent.md)
- Use quando os tickets ou requisitos já existirem e você precisar decompor a solução backend antes de implementar.

### backend-implementer
- Arquivo: [backend-implementer.agent.md](./backend-implementer.agent.md)
- Use quando o plano backend já estiver claro e a próxima etapa for codificar.

## Sequências comuns

1. Entrada do workflow: `PLANNER`
2. Fase 1: `Epic`
3. Fase 2: `Core Flow`
4. Fase 3: `Tickets`
5. Planejamento técnico frontend: `frontend-architect`
6. Implementação frontend: `frontend-implementer`
7. Revisão frontend: `frontend-reviewer`

1. Entrada do workflow: `PLANNER`
2. Fase 1: `Epic`
3. Fase 2: `Core Flow`
4. Fase 3: `Tickets`
5. Planejamento técnico backend: `backend-architect`
6. Implementação backend: `backend-implementer`

## Referências relacionadas

- [../prompts/INDEX.md](../prompts/INDEX.md)
- [../instructions/planning/spec-driven-planning.instructions.md](../instructions/planning/spec-driven-planning.instructions.md)
- [../../backend/docs/ARCHITECTURE-WorkCycle.md](../../backend/docs/ARCHITECTURE-WorkCycle.md)
