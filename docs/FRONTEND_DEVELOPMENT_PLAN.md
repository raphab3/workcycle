# WorkCycle Frontend Development Plan

> Escopo exclusivo do frontend do MVP. Este documento divide a entrega em ciclos de desenvolvimento com objetivos, tarefas, limites de escopo e critérios mínimos de qualidade.

## Objetivo

Organizar a implementação do frontend do WorkCycle em ciclos pequenos, rastreáveis e fechados, com escopo explícito, entregáveis claros e cobertura de testes unitários obrigatória.

## Regras Gerais

- Este plano cobre apenas frontend.
- Toda implementação deve incluir testes unitários.
- Nenhum ciclo é considerado concluído sem build verde e suíte de testes do escopo passando.
- Telas devem seguir o PRD e o design system editorial descrito no produto.
- Novas features devem respeitar a arquitetura modular já definida no projeto: `pages/`, `modules/`, `shared/`, `lib/`, `providers/`, `config/`.
- Componentes de UI devem priorizar primitives reutilizáveis, com separação entre composição de página e lógica de domínio.
- Estado de servidor deve entrar via React Query; formulários via React Hook Form + Zod; estado global apenas quando necessário.

## Definição de Pronto por Ciclo

Cada ciclo só pode ser fechado quando todos os itens abaixo forem atendidos:

1. Escopo do ciclo implementado sem vazar entregas grandes do próximo ciclo.
2. Testes unitários adicionados para toda regra nova, hook novo, utilitário novo e componente com comportamento relevante.
3. Estados de loading, vazio, erro e sucesso cobertos quando aplicável.
4. Tipagem forte sem `any` desnecessário.
5. Build de produção passando.
6. Changelog do ciclo atualizado em `docs/FRONTEND_EXECUTION_CHANGELOG.md`.

## Estratégia de Testes Unitários

- Ferramenta sugerida para o frontend: Vitest + Testing Library.
- Testar comportamento, não implementação interna.
- Cobrir prioritariamente:
  - utilitários puros
  - algoritmos de transformação e score no frontend, se existirem
  - hooks customizados
  - componentes com interação, renderização condicional e validação
  - formulários, schema e estados de submissão
- Componentes puramente visuais sem regra alguma podem usar smoke tests simples de renderização quando fizer sentido.

## Observação de Base Atual

O PRD define `Next.js 14 App Router` como stack final do MVP. Esse alinhamento já foi executado no `Cycle 0`, preservando a arquitetura modular do frontend e adicionando a stack de testes unitários.

## Roadmap por Ciclo

## Cycle 0 — Foundation Alignment

### Objetivo

Alinhar a base técnica do frontend com o PRD e preparar ambiente, testes, shell da aplicação e convenções de desenvolvimento.

### Em escopo

- Definir se o frontend será migrado imediatamente de Vite para Next.js 14 App Router.
- Configurar stack de testes unitários.
- Configurar aliases, providers, layout global, fontes, tokens e base visual editorial.
- Consolidar primitives de UI reutilizáveis.
- Preparar estrutura de navegação principal.

### Fora de escopo

- Implementação completa de regras de negócio.
- CRUDs funcionais.
- Integração real com backend.

### Tasks

- FE-0001: decidir e executar a estratégia de alinhamento Vite -> Next.js ou registrar exceção temporária.
- FE-0002: configurar Vitest, Testing Library e utilitários de testes.
- FE-0003: configurar shell global do app, topbar, navegação principal e layout base.
- FE-0004: aplicar fontes, tokens e base do design system no frontend.
- FE-0005: consolidar primitives iniciais de UI: Button, Card, Chip, Bar, Stepper e MetaLabel.
- FE-0006: criar padrão para mocks e fixtures de frontend.

### Testes mínimos

- Smoke tests das primitives principais.
- Testes do helper `cn` e utilitários compartilhados.
- Testes de renderização do layout principal.

## Cycle 1 — App Shell e Navegação das Telas MVP

### Objetivo

Entregar a navegação estrutural das quatro telas do MVP com estados vazios consistentes e sem lógica final de domínio ainda.

### Em escopo

- Rotas para `Hoje`, `Semana`, `Tarefas` e `Projetos`.
- Layout comum com navegação entre telas.
- Estrutura de páginas e módulos vazios com placeholders reais do produto.
- Estados vazios e blocos-base de conteúdo.

### Fora de escopo

- Formulários completos e integrações finais.
- Algoritmo de geração de escala.

### Tasks

- FE-0101: criar páginas `HojePage`, `SemanaPage`, `TarefasPage` e `ProjetosPage`.
- FE-0102: criar navegação persistente e estados de rota ativa.
- FE-0103: desenhar containers editoriais e padrões de seção para cada tela.
- FE-0104: criar componentes compartilhados de section header, empty state e metric strip.

### Testes mínimos

- Testes de navegação entre rotas.
- Testes de renderização dos estados vazios.
- Testes dos componentes compartilhados criados no ciclo.

## Cycle 2 — Projetos

### Objetivo

Entregar a experiência de cadastro, listagem e edição visual de projetos com foco em percentuais, tipo fixo/rotativo e sprint.

### Em escopo

- Lista de projetos.
- Formulário de projeto.
- Indicadores de soma percentual.
- Estados visuais para projeto ativo, pausado, fixo e rotativo.
- Validações de entrada no frontend.

### Fora de escopo

- Persistência final dependente do backend real.
- Cálculo semanal completo.

### Tasks

- FE-0201: criar módulo `projects` com tipos, mocks, queries temporárias e componentes visuais.
- FE-0202: construir formulário com React Hook Form + Zod.
- FE-0203: criar lista editorial de projetos com chips de tipo e sprint.
- FE-0204: exibir soma de percentuais e alertas de inconsistência.
- FE-0205: modelar estados para dias fixos e horas reservadas.

### Testes mínimos

- Testes do schema de projeto.
- Testes do formulário e mensagens de validação.
- Testes de regras de soma percentual e bloqueio visual.
- Testes dos componentes de lista e variações de status.

## Cycle 3 — Tarefas

### Objetivo

Entregar a gestão de tasks por projeto com prioridade, prazo e status, mantendo o papel informativo definido no PRD.

### Em escopo

- Lista e filtros básicos de tasks.
- Formulário de criação e edição.
- Indicadores visuais de urgência e prioridade.
- Associação por projeto.

### Fora de escopo

- Distribuição automática de tasks entre ciclos.
- Features de board externo.

### Tasks

- FE-0301: criar módulo `tasks` com tipos, schema e estrutura visual.
- FE-0302: implementar tabela ou lista editorial de tasks.
- FE-0303: criar badges e indicadores de atraso, prazo e prioridade.
- FE-0304: criar filtros por projeto, status e prioridade.
- FE-0305: preparar resumo de carga por projeto para uso na tela Hoje.

### Testes mínimos

- Testes do schema de task.
- Testes dos filtros.
- Testes de status visual por prioridade e prazo.
- Testes de resumo de carga agregado no frontend, se calculado localmente.

## Cycle 4 — Hoje

### Objetivo

Implementar a principal experiência do produto: configurar o ciclo do dia, visualizar a sugestão de redistribuição e receber a escala do dia.

### Em escopo

- Formulário de ciclo do dia.
- Banner colapsável de sugestão de redistribuição de percentual.
- Painel de escala com fixos e rotativos.
- Stepper de ajuste manual de horas reais no encerramento.
- Estados de loading, vazio e erro.

### Fora de escopo

- Persistência real final se backend ainda não estiver pronto.
- Timer automático.

### Tasks

- FE-0401: criar módulo `today-cycle` com tipos, schema e componentes.
- FE-0402: implementar formulário de horas disponíveis e projetos por ciclo.
- FE-0403: criar banner de sugestão de redistribuição percentual.
- FE-0404: montar cards ou blocos da escala diária.
- FE-0405: implementar stepper de ajuste de tempo real por projeto.
- FE-0406: integrar o fluxo visual de encerramento do ciclo.

### Testes mínimos

- Testes do schema do ciclo.
- Testes do stepper.
- Testes de renderização condicional dos blocos fixos e rotativos.
- Testes do banner colapsável.
- Testes das regras de distribuição e formatação exibidas no frontend.

## Cycle 5 — Semana

### Objetivo

Entregar a leitura semanal do equilíbrio de horas por projeto e por dia, com destaque para desvios.

### Em escopo

- Tabela ou grade semanal.
- Indicadores de desvio por projeto.
- Sinais visuais `equilibrado`, `atencao` e `critico`.
- Resumos acumulados da semana.

### Fora de escopo

- Avaliação mensal.
- Exportação.

### Tasks

- FE-0501: criar módulo `weekly-balance`.
- FE-0502: implementar grade semanal por dia e projeto.
- FE-0503: criar componentes de status de desvio.
- FE-0504: construir resumo agregado com horas previstas, realizadas e diferença.
- FE-0505: tratar cenários de semana incompleta e domingo opcional.

### Testes mínimos

- Testes das regras de classificação por desvio.
- Testes de renderização da grade semanal.
- Testes de componentes de status e resumo.

## Cycle 6 — Hardening e UX Final do MVP Frontend

### Objetivo

Fechar o frontend do MVP com refinamento visual, acessibilidade, PWA e consistência geral entre módulos.

### Em escopo

- Revisão de acessibilidade.
- Estados vazios, loading e erro em todos os módulos.
- Ajustes de responsividade.
- Manifest e experiência PWA do frontend.
- Revisão de consistência visual e microinterações.

### Fora de escopo

- Novas features funcionais fora do PRD.

### Tasks

- FE-0601: revisar responsividade das telas principais.
- FE-0602: revisar acessibilidade de navegação, labels, foco e contraste.
- FE-0603: finalizar manifest, metadados e assets PWA do frontend.
- FE-0604: revisar loading, erro e empty states de ponta a ponta.
- FE-0605: executar limpeza final de componentes e dependências do frontend.

### Testes mínimos

- Testes unitários adicionais para regressões em helpers, hooks e componentes críticos.
- Testes de acessibilidade básicos dos componentes principais quando aplicável.

## Backlog Pós-MVP Frontend

- Timer automático de sessão.
- Registro de interrupções.
- Nota de retomada.
- Exportação e importação.
- Modo foco.
- Features avançadas de previsão e distribuição automática de tasks.

## Regra Operacional

Antes de iniciar um novo ciclo:

1. Revisar este documento.
2. Abrir ou atualizar a entrada correspondente em `docs/FRONTEND_EXECUTION_CHANGELOG.md`.
3. Confirmar o escopo fechado do ciclo.
4. Confirmar quais testes unitários serão entregues junto da implementação.