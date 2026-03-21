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

Done

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
- [x] FE-0005 definir e executar a estratégia de alinhamento para Next.js 14 App Router conforme PRD
- [x] FE-0006 configurar Vitest + Testing Library
- [x] FE-0007 adicionar testes unitários dos componentes e helpers iniciais

### Critérios de teste unitário

- criar suíte para helpers compartilhados
- criar smoke tests para layout, Button e Card
- validar renderização das páginas base e navegação principal

### Execução

- Data: 2026-03-21
- Responsável: GitHub Copilot com direcionamento do usuário
- Decisões:
  - a base inicial em Vite foi migrada para Next.js App Router para alinhar o frontend ao PRD
  - a arquitetura modular foi preservada, com orquestração de rota agora feita em `src/app/`
  - como `src/pages` conflita com o Pages Router do Next, a composição de rota foi movida para os arquivos do App Router e componentes compartilhados
  - a stack de testes unitários foi padronizada com Vitest + Testing Library
- Riscos:
  - a linha 14.x do Next exibe aviso upstream de vulnerabilidade e deve ser revisitada em hardening ou upgrade futuro
- Dependências:
  - nenhuma para fechamento do ciclo

### Changelog

- Added:
  - estrutura `frontend/` com base React + TypeScript
  - estrutura `backend/` como placeholder
  - páginas base, providers, router e componentes compartilhados iniciais
  - configuração inicial de Tailwind e primitives reutilizáveis
  - estrutura `src/app/` com App Router do Next.js
  - configuração de testes com Vitest, Testing Library e setup global
  - testes unitários para `cn`, `Button`, `Card`, `AppLayout` e rota `/hoje`
- Changed:
  - substituído o template padrão do Vite por uma estrutura modular alinhada ao projeto
  - migrada a base do frontend de Vite para Next.js 14 App Router
  - adaptada a leitura de ambiente de `VITE_API_URL` para `NEXT_PUBLIC_API_URL`
- Fixed:
  - corrigido o conflito entre a pasta `src/pages` e o roteamento nativo do Next
  - corrigida a configuração do Vitest para transformação de JSX em ambiente Next.js
- Removed:
  - removido o template default do Vite do app inicial
  - removidos `vite.config.ts`, `src/main.tsx` e o router baseado em `react-router-dom`

### Evidência de validação

- Build: `pnpm build` do frontend passou em base Next.js App Router
- Tests: `pnpm test:run` passou com 5 arquivos e 7 testes
- Observações:
  - o ciclo foi fechado com migração concluída, stack de testes ativa e cobertura inicial obrigatória entregue

### Pendências para próximo ciclo

- iniciar as rotas do MVP `Hoje`, `Semana`, `Tarefas` e `Projetos`
- consolidar a navegação persistente entre telas
- revisar o aviso de segurança da linha 14.x do Next em ciclo futuro

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