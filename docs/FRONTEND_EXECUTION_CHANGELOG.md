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

Done

### Escopo

- consolidar as rotas do MVP frontend
- criar shell navegável para `Hoje`, `Semana`, `Tarefas` e `Projetos`
- fechar estados vazios e componentes estruturais compartilhados

### Tasks

- [x] FE-0101 criar as quatro páginas do MVP
- [x] FE-0102 adicionar navegação persistente
- [x] FE-0103 criar empty states e section headers reutilizáveis
- [x] FE-0104 adicionar testes unitários das rotas e componentes estruturais

### Critérios de teste unitário

- testar navegação e renderização de rota
- testar estados vazios
- testar layout e componentes estruturais

### Execução

- Data: 2026-03-21
- Responsável: GitHub Copilot com direcionamento do usuário
- Decisões:
  - a navegação persistente foi implementada no shell global via `AppLayout` + `AppNavigation`
  - as rotas iniciais foram mantidas estáticas e editoriais, focadas em estruturar o produto antes da integração real de dados
  - `SectionIntro` e `EmptyState` foram criados como blocos estruturais compartilhados para reduzir repetição entre telas
- Riscos:
  - as telas ainda operam com dados estáticos de preview, então a semântica visual está pronta mas a lógica real entra nos próximos ciclos
  - o aviso upstream do Next 14.x continua pendente para revisão futura
- Dependências:
  - integração dos módulos com dados reais nos próximos ciclos

### Changelog

- Added:
  - rotas `/hoje`, `/semana`, `/tarefas` e `/projetos`
  - componente compartilhado `AppNavigation` com destaque de rota ativa
  - componentes estruturais compartilhados `SectionIntro` e `EmptyState`
  - módulos de preview para hoje, semana, tarefas e projetos
  - testes unitários para navegação, componentes estruturais e rotas do Cycle 1
- Changed:
  - `AppLayout` passou a incluir navegação persistente e indicador de ciclo atual
  - a rota `Hoje` deixou de usar o conteúdo genérico de kickoff e passou a refletir o fluxo do produto
- Fixed:
  - corrigida a tipagem de `typedRoutes` na navegação persistente do Next
  - estabilizado o teste de layout com mock da navegação client-side
- Removed:
  - nenhuma remoção estrutural relevante neste ciclo

### Evidência de validação

- Build: `pnpm build` passou com as rotas `/hoje`, `/semana`, `/tarefas` e `/projetos`
- Tests: `pnpm test:run` passou com 11 arquivos e 14 testes
- Observações:
  - o objetivo deste ciclo foi fechar a estrutura visual e navegável do MVP frontend antes do acoplamento de dados reais

### Pendências para próximo ciclo

- iniciar os formulários e estruturas funcionais da tela `Projetos`
- começar o CRUD visual e filtros da tela `Tarefas`
- decidir a prioridade entre aprofundar `Hoje` ou `Projetos` no próximo ciclo

## Cycle 2 — Projetos

### Status

Planned

### Escopo

- entregar a experiência de cadastro, listagem e edição visual de projetos
- cobrir percentuais, tipo fixo ou rotativo e sprint
- estruturar validações de entrada e estados visuais da tela de projetos

### Tasks

- [ ] FE-0201 criar módulo `projects` com tipos, mocks, queries temporárias e componentes visuais
- [ ] FE-0202 construir formulário com React Hook Form + Zod
- [ ] FE-0203 criar lista editorial de projetos com chips de tipo e sprint
- [ ] FE-0204 exibir soma de percentuais e alertas de inconsistência
- [ ] FE-0205 modelar estados para dias fixos e horas reservadas

### Critérios de teste unitário

- testar o schema de projeto
- testar o formulário e mensagens de validação
- testar as regras de soma percentual e bloqueio visual
- testar os componentes de lista e suas variações de status

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

## Cycle 3 — Tarefas

### Status

Planned

### Escopo

- entregar a gestão de tasks por projeto com prioridade, prazo e status
- estruturar a associação por projeto e filtros básicos da tela
- preparar o resumo de carga para uso futuro na tela Hoje

### Tasks

- [ ] FE-0301 criar módulo `tasks` com tipos, schema e estrutura visual
- [ ] FE-0302 implementar tabela ou lista editorial de tasks
- [ ] FE-0303 criar badges e indicadores de atraso, prazo e prioridade
- [ ] FE-0304 criar filtros por projeto, status e prioridade
- [ ] FE-0305 preparar resumo de carga por projeto para uso na tela Hoje

### Critérios de teste unitário

- testar o schema de task
- testar os filtros
- testar os estados visuais por prioridade e prazo
- testar o resumo de carga agregado no frontend quando houver cálculo local

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

## Cycle 4 — Hoje

### Status

Planned

### Escopo

- implementar a principal experiência do produto na tela Hoje
- receber horas disponíveis e projetos por ciclo
- exibir a sugestão de redistribuição e a escala do dia
- permitir ajuste manual de horas reais no encerramento do ciclo

### Tasks

- [ ] FE-0401 criar módulo `today-cycle` com tipos, schema e componentes
- [ ] FE-0402 implementar formulário de horas disponíveis e projetos por ciclo
- [ ] FE-0403 criar banner de sugestão de redistribuição percentual
- [ ] FE-0404 montar cards ou blocos da escala diária
- [ ] FE-0405 implementar stepper de ajuste de tempo real por projeto
- [ ] FE-0406 integrar o fluxo visual de encerramento do ciclo

### Critérios de teste unitário

- testar o schema do ciclo
- testar o stepper
- testar a renderização condicional dos blocos fixos e rotativos
- testar o banner colapsável
- testar as regras de distribuição e formatação exibidas no frontend

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

## Cycle 5 — Semana

### Status

Planned

### Escopo

- entregar a leitura semanal do equilíbrio de horas por projeto e por dia
- destacar desvios acumulados e status visuais por projeto
- consolidar resumos semanais no frontend

### Tasks

- [ ] FE-0501 criar módulo `weekly-balance`
- [ ] FE-0502 implementar grade semanal por dia e projeto
- [ ] FE-0503 criar componentes de status de desvio
- [ ] FE-0504 construir resumo agregado com horas previstas, realizadas e diferença
- [ ] FE-0505 tratar cenários de semana incompleta e domingo opcional

### Critérios de teste unitário

- testar as regras de classificação por desvio
- testar a renderização da grade semanal
- testar os componentes de status e resumo

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

## Cycle 6 — Hardening e UX Final do MVP Frontend

### Status

Planned

### Escopo

- fechar o frontend do MVP com refinamento visual, acessibilidade, PWA e consistência geral
- revisar responsividade, estados transversais e experiência final do app
- estabilizar a base para a entrega do mock funcional completo

### Tasks

- [ ] FE-0601 revisar responsividade das telas principais
- [ ] FE-0602 revisar acessibilidade de navegação, labels, foco e contraste
- [ ] FE-0603 finalizar manifest, metadados e assets PWA do frontend
- [ ] FE-0604 revisar loading, erro e empty states de ponta a ponta
- [ ] FE-0605 executar limpeza final de componentes e dependências do frontend

### Critérios de teste unitário

- adicionar testes unitários de regressão para helpers, hooks e componentes críticos
- adicionar testes básicos de acessibilidade dos componentes principais quando aplicável

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

- backlog pos-MVP frontend

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