# Agentes

Este diretório reúne agentes especializados para planejamento, implementação e revisão no repositório.

## Quando usar cada agente

### PLANNER
- Arquivo: [PLANNER.agent.md](./PLANNER.agent.md)
- Use quando a ideia ainda estiver vaga e você precisar sair de problema aberto para artefatos em `docs/planning/`.
- Fluxo principal: `Kickoff -> Epic -> Core Flow -> Tickets`.
- O agente foi configurado para `target: vscode`, usando `vscode/askQuestions` para rodadas curtas com opções clicáveis sempre que houver escolhas delimitadas.
- Após aprovação de cada fase, use os handoffs clicáveis para seguir para `CORE FLOW`, `TICKETS` ou para agentes de revisão e execução.
- Assim que o `EPIC` for aprovado, o agente deve criar `docs/planning/[epic-slug]/` automaticamente e salvar `epic.md` nessa pasta.
- O `epic-slug` deve ser gerado automaticamente a partir do título do Epic em formato kebab-case ASCII.

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

1. Descoberta e especificação: `PLANNER`
2. Planejamento técnico frontend: `frontend-architect`
3. Implementação frontend: `frontend-implementer`
4. Revisão frontend: `frontend-reviewer`

1. Descoberta e especificação: `PLANNER`
2. Planejamento técnico backend: `backend-architect`
3. Implementação backend: `backend-implementer`

## Referências relacionadas

- [../prompts/INDEX.md](../prompts/INDEX.md)
- [../instructions/planning/spec-driven-planning.instructions.md](../instructions/planning/spec-driven-planning.instructions.md)
- [../../backend/docs/ARCHITECTURE-WorkCycle.md](../../backend/docs/ARCHITECTURE-WorkCycle.md)
