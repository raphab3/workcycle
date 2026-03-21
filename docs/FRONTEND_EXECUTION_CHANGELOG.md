# WorkCycle Frontend Execution + Changelog

> Registro operacional por ciclo. Cada ciclo deve manter escopo fechado, tarefas objetivas, execução rastreável e changelog atualizado.

## Regras de Uso

- Este documento cobre apenas frontend.
- Toda implementação registrada aqui deve vir acompanhada de testes unitários.
- Cada ciclo deve ser atualizado durante a execução, não apenas no fechamento.
- Se algum item planejado sair do escopo, registrar explicitamente em `Descartado` ou `Adiado`.

## Template de Ciclo

Copiar este bloco ao iniciar um novo ciclo:

```md
## Cycle X — Nome do ciclo

### Status

Planned | In Progress | Blocked | Done

### Escopo

-

### Tasks

- [ ] FE-XXXX descricao da task
- [ ] FE-XXXX descricao da task

### Critérios de teste unitário

-

### Execução

- Data: AAAA-MM-DD
- Responsável:
- Decisões:
- Riscos:
- Dependências:

### Changelog

- Added:
- Changed:
- Fixed:
- Removed:

### Evidência de validação

- Build:
- Tests:
- Observações:

### Pendências para próximo ciclo

-
```

## Cycle 0 — Foundation Alignment

### Status

In Progress

### Escopo

- alinhar a fundação do frontend ao PRD
- preparar shell de aplicação, layout base e primitives iniciais
- preparar ambiente de testes unitários
- registrar a decisão sobre a stack final de frontend

### Tasks

- [x] FE-0001 criar a estrutura inicial `backend/` e `frontend/`
- [x] FE-0002 scaffold inicial do frontend em React + TypeScript
- [x] FE-0003 aplicar arquitetura modular base com `pages/`, `modules/`, `shared/`, `lib/`, `providers/` e `config/`
- [x] FE-0004 configurar stack visual inicial com Tailwind, primitives reutilizáveis e base de layout
- [ ] FE-0005 definir e executar a estratégia de alinhamento para Next.js 14 App Router conforme PRD
- [ ] FE-0006 configurar Vitest + Testing Library
- [ ] FE-0007 adicionar testes unitários dos componentes e helpers iniciais

### Critérios de teste unitário

- criar suíte para helpers compartilhados
- criar smoke tests para layout, Button e Card
- validar renderização das páginas base e navegação principal

### Execução

- Data: 2026-03-21
- Responsável: GitHub Copilot com direcionamento do usuário
- Decisões:
  - a base inicial do frontend foi criada em Vite para acelerar o scaffold
  - a arquitetura modular já foi aplicada desde o início
  - o alinhamento final com Next.js permanece pendente e precisa ser tratado explicitamente
- Riscos:
  - o PRD pede Next.js, mas a base inicial está em Vite
  - os testes unitários ainda não foram configurados, então o ciclo não pode ser fechado
- Dependências:
  - decisão sobre migração para Next.js
  - instalação e configuração da stack de testes

### Changelog

- Added:
  - estrutura `frontend/` com base React + TypeScript
  - estrutura `backend/` como placeholder
  - páginas base, providers, router e componentes compartilhados iniciais
  - configuração inicial de Tailwind e primitives reutilizáveis
- Changed:
  - substituído o template padrão do Vite por uma estrutura modular alinhada ao projeto
- Fixed:
  - nao se aplica neste ciclo ainda
- Removed:
  - removido o template default do Vite do app inicial

### Evidência de validação

- Build: `pnpm build` do frontend passou
- Tests: ainda não configurados
- Observações:
  - este ciclo permanece aberto até a stack de testes estar configurada e a decisão sobre Next.js ser executada ou formalmente registrada

### Pendências para próximo ciclo

- configurar Vitest + Testing Library
- criar os primeiros testes unitários obrigatórios
- decidir a migração ou exceção temporária para Next.js

## Cycle 1 — App Shell e Navegação das Telas MVP

### Status

Planned

### Escopo

- consolidar as rotas do MVP frontend
- criar shell navegável para `Hoje`, `Semana`, `Tarefas` e `Projetos`
- fechar estados vazios e componentes estruturais compartilhados

### Tasks

- [ ] FE-0101 criar as quatro páginas do MVP
- [ ] FE-0102 adicionar navegação persistente
- [ ] FE-0103 criar empty states e section headers reutilizáveis
- [ ] FE-0104 adicionar testes unitários das rotas e componentes estruturais

### Critérios de teste unitário

- testar navegação e renderização de rota
- testar estados vazios
- testar layout e componentes estruturais

### Execução

- Data:
- Responsável:
- Decisões:
- Riscos:
- Dependências:

### Changelog

- Added:
- Changed:
- Fixed:
- Removed:

### Evidência de validação

- Build:
- Tests:
- Observações:

### Pendências para próximo ciclo

-

## Convenções de Changelog

Use sempre estas categorias:

- `Added` para novas telas, módulos, componentes, hooks, tipos e testes
- `Changed` para ajustes de comportamento, layout, arquitetura ou contrato
- `Fixed` para correções de bug, regressão ou inconsistência visual
- `Removed` para exclusão de código, dependências ou fluxos descartados

## Regra de Fechamento de Ciclo

Um ciclo só muda para `Done` quando:

1. Todas as tasks em escopo estão concluídas ou explicitamente adiadas.
2. Os testes unitários planejados para o ciclo existem e estão passando.
3. O changelog está preenchido.
4. O próximo ciclo tem pendências registradas.