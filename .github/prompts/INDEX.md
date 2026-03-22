# Índice de Prompts

Este diretório organiza o fluxo de planejamento do PLANNER do início da descoberta até a geração de tickets.

## Ordem recomendada

1. [0-kickoff.prompt.md](./0-kickoff.prompt.md)
   Use para iniciar a conversa quando a ideia ainda estiver vaga, incompleta ou sem framing claro.
2. [1-epic.prompt.md](./1-epic.prompt.md)
   Use para conduzir a Fase 1, removendo ambiguidades e gerando `epic.md`.
3. [2-core-flow.prompt.md](./2-core-flow.prompt.md)
   Use para decompor o Epic aprovado em fluxos, módulos, dependências e diagramas.
4. [3-tickets.prompt.md](./3-tickets.prompt.md)
   Use para transformar o Core Flow aprovado em tickets acionáveis e independentes.

## Fluxo resumido

`Kickoff -> Epic -> Core Flow -> Tickets`

## Regras do fluxo

- Não avance para `Core Flow` sem `Epic` aprovado.
- Não avance para `Tickets` sem `Core Flow` aprovado.
- Detecte a stack do repositório antes de recomendar abordagem técnica.
- Prefira deixar perguntas em aberto a inventar detalhes.

## Agente relacionado

- [PLANNER.agent.md](../agents/PLANNER.agent.md)