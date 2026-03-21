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

Done

### Escopo

- entregar a experiência de cadastro, listagem e edição visual de projetos
- cobrir percentuais, tipo fixo ou rotativo e sprint
- estruturar validações de entrada e estados visuais da tela de projetos

### Tasks

- [x] FE-0201 criar módulo `projects` com tipos, mocks, queries temporárias e componentes visuais
- [x] FE-0202 construir formulário com React Hook Form + Zod
- [x] FE-0203 criar lista editorial de projetos com chips de tipo e sprint
- [x] FE-0204 exibir soma de percentuais e alertas de inconsistência
- [x] FE-0205 modelar estados para dias fixos e horas reservadas

### Critérios de teste unitário

- testar o schema de projeto
- testar o formulário e mensagens de validação
- testar as regras de soma percentual e bloqueio visual
- testar os componentes de lista e suas variações de status

### Execução

- Data: 2026-03-21
- Responsável: GitHub Copilot com direcionamento do usuário
- Decisões:
  - a tela `Projetos` deixou de ser apenas um preview estático e passou a operar como mock funcional client-side
  - a persistência continua local ao módulo neste ciclo, preservando escopo fechado enquanto o backend não entra
  - o formulário foi implementado com React Hook Form + Zod e validações condicionais para projetos fixos
  - a modelagem de domínio foi tipada com `Project`, `ProjectFormValues`, `SprintDays` e variações de status e tipo
- Riscos:
  - a carteira ainda não persiste entre recargas e precisará ser conectada ao backend ou storage em ciclos futuros
  - a edição cobre os dados principais do projeto, mas ainda não há ordenação, busca ou filtros avançados
- Dependências:
  - integração futura do módulo com endpoints reais de projetos
  - reaproveitamento do resumo percentual na tela `Hoje`

### Changelog

- Added:
  - tipos fortes e mocks do domínio `projects`
  - helpers de soma percentual, delta e formatação de agenda fixa
  - componente `ProjectsWorkspace` com resumo, consistência da carteira e edição local
  - componente `ProjectForm` com RHF + Zod e regras condicionais para projetos fixos
  - componente `ProjectsList` com estados ativo, pausado, fixo e rotativo
  - testes unitários para schema, helpers, formulário, lista, workspace e rota `/projetos`
- Changed:
  - a rota `/projetos` passou a renderizar a experiência funcional do módulo em vez de cards estáticos editoriais
  - o resumo da tela agora mostra total alocado, delta até 100% e mensagem semafórica de consistência
- Fixed:
  - corrigido o alinhamento de tipos entre Zod e React Hook Form para schema com coercion e unions literais
  - removidos reexports conflitantes que causavam resolução incorreta dos componentes do módulo
- Removed:
  - removido o preview estático `ProjectsPortfolioPreview`

### Evidência de validação

- Build: `pnpm build` passou com a rota `/projetos` gerando bundle funcional do módulo
- Tests: `pnpm test:run` passou com 16 arquivos e 25 testes
- Observações:
  - o ciclo foi fechado com formulário funcional, edição local, pausa/reativação de projeto e cobertura unitária do comportamento relevante

### Pendências para próximo ciclo

- iniciar o Cycle 3 com CRUD visual de tarefas e associação por projeto
- reaproveitar os projetos cadastrados como base dos filtros e resumos do módulo de tarefas

## Cycle 3 — Tarefas

### Status

Done

### Escopo

- entregar a gestão de tasks por projeto com prioridade, prazo e status
- estruturar a associação por projeto e filtros básicos da tela
- preparar o resumo de carga para uso futuro na tela Hoje

### Tasks

- [x] FE-0301 criar módulo `tasks` com tipos, schema e estrutura visual
- [x] FE-0302 implementar tabela ou lista editorial de tasks
- [x] FE-0303 criar badges e indicadores de atraso, prazo e prioridade
- [x] FE-0304 criar filtros por projeto, status e prioridade
- [x] FE-0305 preparar resumo de carga por projeto para uso na tela Hoje

### Critérios de teste unitário

- testar o schema de task
- testar os filtros
- testar os estados visuais por prioridade e prazo
- testar o resumo de carga agregado no frontend quando houver cálculo local

### Execução

- Data: 2026-03-21
- Responsável: GitHub Copilot com direcionamento do usuário
- Decisões:
  - a tela `Tarefas` passou de preview estático para mock funcional com backlog local, filtros e edição
  - a carteira de projetos do Cycle 2 foi reaproveitada como fonte de associacao do formulario e dos filtros
  - o resumo por projeto passou a consolidar apenas tasks abertas para servir de base ao fluxo da tela `Hoje`
  - o estado segue local ao módulo neste ciclo para manter escopo fechado antes da integracao com backend
- Riscos:
  - ainda nao existe persistencia entre recargas
  - os filtros cobrem projeto, prioridade e status, mas ainda nao incluem busca textual ou ordenacao
- Dependências:
  - integracao futura com dados reais de projetos e tarefas
  - reaproveitamento do resumo de carga na tela `Hoje`

### Changelog

- Added:
  - tipos fortes do domínio `tasks`, mocks e helpers de prazo, filtro e resumo de carga
  - componente `TasksWorkspace` com backlog funcional, resumo e associacao com projetos
  - componente `TaskForm` com React Hook Form + Zod
  - componente `TaskFilters` ligado aos projetos do Cycle 2
  - lista funcional de tarefas com estados de prioridade, prazo e status
  - testes unitários para schema, helpers, formulário, workspace e rota `/tarefas`
- Changed:
  - a rota `/tarefas` deixou de renderizar cards estáticos e passou a operar como painel funcional de backlog
  - a experiência agora mostra contadores de tasks abertas, urgentes e esforço total em aberto
- Fixed:
  - corrigido o teste de filtro para diferenciar explicitamente o campo `Projeto` do filtro e do formulário
- Removed:
  - removido o preview estático `TasksBoardPreview`

### Evidência de validação

- Build: `pnpm build` passou com a rota `/tarefas` gerando bundle funcional do módulo
- Tests: `pnpm test:run` passou com 20 arquivos e 35 testes
- Observações:
  - o ciclo foi fechado com criação, edição, conclusão, filtros e resumo de carga por projeto funcionando localmente

### Pendências para próximo ciclo

- iniciar o Cycle 4 na tela `Hoje`, consumindo projetos e resumo de carga como insumos do planejamento diário
- decidir se a persistência temporária de tarefas e projetos entra antes ou junto da integração com backend

## Cycle 4 — Hoje

### Status

Done

### Escopo

- implementar a principal experiência do produto na tela Hoje
- receber horas disponíveis e projetos por ciclo
- exibir a sugestão de redistribuição e a escala do dia
- permitir ajuste manual de horas reais no encerramento do ciclo
- Adicionar data e hora atual, banner

### Tasks

- [x] FE-0401 criar módulo `today-cycle` com tipos, schema e componentes
- [x] FE-0402 implementar formulário de horas disponíveis e projetos por ciclo
- [x] FE-0403 criar banner de sugestão de redistribuição percentual
- [x] FE-0404 montar cards ou blocos da escala diária
- [x] FE-0405 implementar stepper de ajuste de tempo real por projeto
- [x] FE-0406 integrar o fluxo visual de encerramento do ciclo

### Critérios de teste unitário

- testar o schema do ciclo
- testar o stepper
- testar a renderização condicional dos blocos fixos e rotativos
- testar o banner colapsável
- testar as regras de distribuição e formatação exibidas no frontend

### Execução

- Data: 2026-03-21
- Responsável: GitHub Copilot com direcionamento do usuário
- Decisões:
  - a tela `Hoje` passou de visão estática para fluxo funcional client-side com recalculo do ciclo e ajuste manual
  - o planejamento reutiliza a carteira ativa de projetos do Cycle 2 e o resumo de carga aberta das tasks do Cycle 3
  - o banner de redistribuição foi implementado como bloco colapsável para comparar percentual atual e sugerido sem sobrecarregar a leitura principal
  - o ajuste real foi tratado com stepper incremental de 0.5h por projeto para manter a interação simples no mock
  - foi adicionada referência temporal do plano com data e hora atuais na própria tela
- Riscos:
  - o fluxo ainda usa mocks compartilhados e não persiste entre recargas
  - como projetos e tasks ainda não compartilham store ou backend, a tela `Hoje` consome o estado base do mock e não as edições feitas nas rotas anteriores em tempo real
- Dependências:
  - integração futura com persistência ou camada compartilhada de dados
  - reaproveitamento do fechamento diário na leitura semanal do Cycle 5

### Changelog

- Added:
  - tipos fortes e helpers do domínio `today` para ciclo, distribuição sugerida e horas reais
  - componente `TodayCycleForm` com React Hook Form + Zod
  - componente `SuggestionBanner` colapsável com comparação entre percentual atual e sugerido
  - componente `ExecutionAdjuster` com stepper de ajuste manual por projeto
  - resumo visual de carga por projeto consumindo a base de tasks abertas
  - testes unitários para schema do ciclo, helpers do planner e comportamento interativo da tela `Hoje`
- Changed:
  - a rota `/hoje` passou a operar como painel funcional de planejamento diário
  - a escala sugerida agora é recalculada a partir de horas disponíveis, quantidade de projetos no ciclo e carga aberta das tasks
  - a tela passou a exibir data e hora atuais como referência do plano em execução
- Fixed:
  - corrigido o boundary client/server do componente principal da tela `Hoje` para o App Router do Next
  - corrigidos os testes do planner para refletir a estrutura final da UI e evitar ambiguidades de texto
- Removed:
  - removida a visão estática anterior da distribuição editorial do dia

### Evidência de validação

- Build: `pnpm build` passou com a rota `/hoje` gerando bundle funcional do módulo
- Tests: `pnpm test:run` passou com 23 arquivos e 42 testes
- Observações:
  - uma tentativa de build em paralelo com a suíte de testes gerou falha transitória de `/_document`; a validação isolada do build passou normalmente
  - o ciclo foi fechado com formulário do ciclo, banner colapsável, escala sugerida e stepper de horas reais funcionando localmente

### Pendências para próximo ciclo

- iniciar o Cycle 5 na tela `Semana`, reutilizando horas previstas e horas ajustadas como base dos desvios semanais
- decidir se a persistência compartilhada entra antes da leitura semanal para evitar divergência entre as rotas

## Cycle 5 — Semana

### Status

Done

### Escopo

- entregar a leitura semanal do equilíbrio de horas por projeto e por dia
- destacar desvios acumulados e status visuais por projeto
- consolidar resumos semanais no frontend

### Tasks

- [x] FE-0501 criar módulo `weekly-balance`
- [x] FE-0502 implementar grade semanal por dia e projeto
- [x] FE-0503 criar componentes de status de desvio
- [x] FE-0504 construir resumo agregado com horas previstas, realizadas e diferença
- [x] FE-0505 tratar cenários de semana incompleta e domingo opcional

### Critérios de teste unitário

- testar as regras de classificação por desvio
- testar a renderização da grade semanal
- testar os componentes de status e resumo

### Execução

- Data: 2026-03-21
- Responsável: GitHub Copilot com direcionamento do usuário
- Decisões:
  - a tela `Semana` passou de preview estático para uma leitura funcional de desvios derivada do planejamento e do ajuste real do Cycle 4
  - as horas previstas e ajustadas foram usadas como baseline para gerar uma semana simulada por projeto e por dia
  - a classificação semanal foi simplificada em `equilibrado`, `atencao` e `critico` com base no delta acumulado em horas
  - a grade semanal foi mantida em seis dias (`Seg` a `Sab`) para acompanhar o modelo atual do mock funcional
- Riscos:
  - a semana ainda e simulada a partir dos mocks e nao consome uma persistencia compartilhada real
  - o domingo continua fora do escopo funcional neste ciclo e pode precisar revisao se entrar no fluxo final do produto
- Dependências:
  - integracao futura com estado compartilhado ou backend para refletir ajustes reais vindos da tela `Hoje`
  - refinamento final de responsividade e consistencia visual no Cycle 6

### Changelog

- Added:
  - tipos fortes e helpers do domínio `weekly` para linhas, células, resumos e status de desvio
  - componente `WeeklyBalanceWorkspace` com cards de resumo, grade semanal e leitura operacional
  - testes unitários para helpers semanais, workspace e rota `/semana`
- Changed:
  - a rota `/semana` deixou de renderizar um quadro editorial estático e passou a exibir desvios calculados a partir das horas previstas e ajustadas
  - a tela agora consolida horas previstas, horas reais, delta e status por projeto
- Fixed:
  - corrigido o teste do workspace semanal para evitar ambiguidade em textos repetidos entre grade e cards de insight
- Removed:
  - removido o preview estático `WeeklyBalancePreview`

### Evidência de validação

- Build: `pnpm build` passou com a rota `/semana` gerando bundle funcional do módulo
- Tests: `pnpm test:run` passou com 25 arquivos e 47 testes
- Observações:
  - o ciclo foi fechado com grade semanal funcional, status de desvio e resumos agregados calculados localmente a partir do baseline do Cycle 4

### Pendências para próximo ciclo

- iniciar o Cycle 6 com refinamento de responsividade, acessibilidade e estados transversais
- decidir se a persistência compartilhada entra ainda no mock final ou fica explicitamente fora do escopo do MVP frontend

## Cycle 6 — Hardening e UX Final do MVP Frontend

### Status

In Progress

### Escopo

- fechar o frontend do MVP com refinamento visual, acessibilidade, PWA e consistência geral
- revisar responsividade, estados transversais e experiência final do app
- estabilizar a base para a entrega do mock funcional completo

### Tasks

- [x] FE-0601 revisar responsividade das telas principais
- [x] FE-0602 revisar acessibilidade de navegação, labels, foco e contraste
- [ ] FE-0603 finalizar manifest, metadados e assets PWA do frontend
- [x] FE-0604 revisar loading, erro e empty states de ponta a ponta
- [ ] FE-0605 executar limpeza final de componentes e dependências do frontend

### Critérios de teste unitário

- adicionar testes unitários de regressão para helpers, hooks e componentes críticos
- adicionar testes básicos de acessibilidade dos componentes principais quando aplicável

### Execução

- Data: 2026-03-21
- Responsável: GitHub Copilot com direcionamento do usuário
- Decisões:
  - o hardening foi iniciado pelo shell compartilhado e pelos estados transversais antes da etapa de PWA e limpeza final
  - foi criado um aviso transversal de limitação do mock para deixar explícita a ausência de persistência compartilhada entre rotas
  - a grade semanal recebeu melhoria específica de overflow horizontal e semântica de tabela para reduzir risco mobile e melhorar leitura assistiva
  - o shell passou a expor skip link e landmark de conteúdo para navegação por teclado
- Riscos:
  - o app continua operando sobre mocks locais, então parte da UX final ainda depende da decisão sobre persistência compartilhada
  - manifesto PWA, metadados finais e limpeza de dependências continuam pendentes
- Dependências:
  - definição do escopo final de persistência local ou integração real para o fechamento do mock
  - execução da etapa PWA no restante do Cycle 6

### Changelog

- Added:
  - componente compartilhado `StateNotice` para comunicar estado local, limitação de persistência e consistência do mock
  - skip link no shell principal para navegação direta ao conteúdo
  - testes unitários de regressão para `StateNotice` e semântica acessível da tela semanal
  - fallbacks de empty state nas telas `Projetos`, `Tarefas`, `Hoje` e `Semana`
- Changed:
  - `AppLayout` passou a expor landmark de conteúdo focável e badge de status alinhada ao Cycle 6
  - `AppNavigation` foi ajustada para navegação horizontal segura em telas menores
  - a grade da tela `Semana` passou a usar semântica de tabela e overflow horizontal responsivo
  - as telas principais passaram a exibir aviso transversal sobre dados locais e sincronização parcial
- Fixed:
  - reduzido o risco de overflow horizontal no shell e na grade semanal
  - reforçada a navegação por teclado com skip link, foco explícito e landmarks mais claros
  - melhorada a cobertura de estados vazios para evitar telas incoerentes quando a base mock estiver ausente
- Removed:
  - nenhuma remoção estrutural relevante nesta etapa parcial do ciclo

### Evidência de validação

- Build: `pnpm build` passou com o hardening aplicado nas rotas principais
- Tests: `pnpm test:run` passou com 26 arquivos e 48 testes
- Observações:
  - esta etapa cobre a primeira metade prática do Cycle 6: responsividade, acessibilidade e estados transversais
  - `FE-0603` e `FE-0605` permanecem abertos para fechamento do ciclo

### Pendências para próximo ciclo

- finalizar manifest, metadados e assets PWA do frontend
- revisar limpeza final de componentes, textos de scaffold e dependências antes do fechamento do MVP frontend

## Cycle 7 — Contexto Operacional da Tela Hoje

### Status

Done

### Escopo

- substituir o topo editorial da tela `Hoje` por contexto operacional orientado a uso real
- consolidar sinais de ritmo diario, leitura semanal, janela mensal e atrasos a partir dos dados ja existentes
- manter a tela `Hoje` como orquestracao, movendo os calculos para helper do dominio

### Tasks

- [x] FE-0701 mapear indicadores de hoje, semana e mes a partir de projetos, tasks e escala atual
- [x] FE-0702 substituir o bloco fixo inicial por cards de contexto operacional
- [x] FE-0703 expor sinais de atraso, carga futura e projeto sob maior pressao
- [x] FE-0704 revisar refinamento visual final junto do restante do hardening

### Critérios de teste unitário

- testar o helper que monta o contexto operacional com ritmo, backlog e risco
- testar a renderizacao do topo contextual na rota `Hoje`

### Execução

- Data: 2026-03-21
- Responsável: GitHub Copilot com direcionamento do usuário
- Decisões:
  - o contexto do topo passou a ser derivado do plano atual do dia em vez de texto editorial fixo
  - a leitura semanal e mensal foi apresentada como projecao do ritmo observado hoje para manter consistencia com o pedido de contexto "baseado no hoje"
  - os sinais de atraso consideram tasks vencidas, vencendo hoje, bloqueadas e projetos pausados com carga ainda aberta
  - a shell principal foi elevada para um layout de produto com sidebar colapsavel, header superior e theme mode persistido em design system tokens
- Riscos:
  - enquanto a sincronizacao entre rotas continuar local, o contexto refletira a base mock e nao as ultimas edicoes feitas em outras telas em tempo real
  - a projecao semanal e mensal ainda e heuristica, nao calendario real
- Dependências:
  - decisao final sobre persistencia compartilhada
  - continuidade do hardening visual dos ciclos 6 e 7

### Changelog

- Added:
  - helper `buildTodayOperationalContext` para consolidar ritmo diario, projecao semanal, janela mensal e sinais de risco
  - testes unitarios do contexto operacional da tela `Hoje`
  - provider de tema com modos claro e escuro e arquivo central de theme do design system
  - shell principal com sidebar colapsavel, header superior e controles de busca, notificacao e conta
- Changed:
  - o topo da tela `Hoje` deixou de exibir copy editorial fixa e passou a mostrar cards contextuais baseados na carteira e na carga aberta
  - o resumo vindo das tarefas passou a alimentar explicitamente a priorizacao da escala e da leitura contextual
  - o app passou a usar melhor a largura disponivel com content area expandida e grid mais respirado na tela `Hoje`
- Fixed:
  - reduzido o descolamento entre a narrativa da tela e o uso real do produto no mock funcional
  - corrigido o shell espremido em desktop e mobile com navegação lateral, header e melhor distribuicao responsiva
- Removed:
  - removido o excesso de copy descritiva sem valor operacional no topo da tela `Hoje`

### Evidência de validação

- Build: `pnpm build` passou com shell, provider de tema e rota `/hoje` compilando em producao
- Tests: `pnpm vitest run src/shared/components/AppLayout/index.test.tsx src/shared/components/AppNavigation/index.test.tsx src/modules/today/components/TodayPlannerOverview/index.test.tsx 'src/app/(pages)/hoje/page.test.tsx'` passou com 4 arquivos e 11 testes
- Observações:
  - este ciclo complementa o hardening anterior ao focar na utilidade do contexto exibido para o usuario final e na qualidade da shell principal

### Pendências para próximo ciclo

- retomar o fechamento do Cycle 6 com PWA e limpeza final de dependencias e componentes
- decidir quando a sincronizacao real entre rotas sai do mock local para estado compartilhado

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