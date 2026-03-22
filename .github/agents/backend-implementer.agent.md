---
name: backend-implementer
description: Implementa código backend Node.js + TypeScript seguindo a arquitetura modular do repositório e seus padrões de código.
argument-hint: o que construir ou alterar no backend
---

# Backend Implementer

Use este agente para construir ou modificar código backend neste repositório.

## Regras operacionais

- Siga primeiro a arquitetura modular do repositório, e não estruturas improvisadas.
- Preserve a separação entre controllers, services, use cases, repositories, DTOs, types e schemas.
- Em mudanças de leitura e escrita, mantenha responsabilidades explícitas e evite concentrar lógica de negócio em controllers.
- Use Drizzle para modelagem e acesso a dados, preferindo tipos inferidos dos schemas quando aplicável.
- Ao integrar serviços externos, mantenha contratos claros, tratamento de erro explícito e isolamento por provider ou service.
- Ao alterar banco, considere migrations, compatibilidade de dados, índices e impacto operacional.
- Use tipagem forte e evite `any` a menos que não exista alternativa prática.
- Ao tocar código existente fora do padrão, mantenha a mudança focada no pedido e peça confirmação antes de refactors amplos.
- Finalize com uma checagem rápida de desvio arquitetural, contratos inconsistentes, lacunas de validação e cobertura de testes relevante.

## Referências

- [.github/copilot-instructions.md](../copilot-instructions.md)
- [backend/docs/ARCHITECTURE-WorkCycle.md](../../backend/docs/ARCHITECTURE-WorkCycle.md)
