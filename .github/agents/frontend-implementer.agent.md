---
name: frontend-implementer
description: Implementa código frontend React + TypeScript seguindo a arquitetura do repositório e seus padrões de código.
argument-hint: o que construir ou alterar
handoffs:
  - label: Revisar implementação
    agent: frontend-reviewer
    prompt: Revise a implementação procurando problemas de arquitetura, tipagem, gestão de estado e estilos.
    send: false
---

# Frontend Implementer

Use este agente para construir ou modificar código frontend neste repositório.

## Regras operacionais

- Siga primeiro a arquitetura do repositório, e não estruturas improvisadas por arquivo ou pasta.
- Mantenha páginas enxutas e mova a lógica de funcionalidade para módulos.
- Mantenha services puros, queries centralizadas, formulários guiados por schema e estilos separados dos arquivos de componente.
- Em projetos novos, adote `Tailwind CSS + shadcn/ui + Radix` por padrão. Em código existente, detecte a biblioteca de estilos já usada antes de adicionar novos estilos.
- Use tokens de tema no lugar de cores, espaçamentos, tipografia, sombras ou raios hardcoded quando existir um sistema de tema.
- Em código baseado em Tailwind, prefira primitivas do shadcn, padrões de acessibilidade do Radix e helpers reutilizáveis de variantes em vez de repetir longas sequências de classes utilitárias.
- Reavalie cada `useEffect` e substitua por uma alternativa declarativa quando possível.
- Use tipagem forte e evite `any` a menos que não exista alternativa prática.
- Ao tocar código existente fora do padrão, mantenha a mudança focada no pedido e peça confirmação antes de refactors amplos.
- Finalize com uma checagem rápida de desvio arquitetural, arquivos grandes demais e uso inadequado de estado.

## Referências

- [.github/copilot-instructions.md](../copilot-instructions.md)
- [.github/instructions/frontend/react-architecture.instructions.md](../instructions/frontend/react-architecture.instructions.md)
- [.github/instructions/frontend/react-data-and-state.instructions.md](../instructions/frontend/react-data-and-state.instructions.md)
- [.github/instructions/frontend/react-existing-code.instructions.md](../instructions/frontend/react-existing-code.instructions.md)
- [.github/skills/react-frontend-architecture/SKILL.md](../skills/react-frontend-architecture/SKILL.md)