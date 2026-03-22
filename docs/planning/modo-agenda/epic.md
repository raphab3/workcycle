# Epic: Modo Agenda

> **Status:** Proposto | **Data:** 2026-03-22 | **Stack detectada:** Monorepo com backend NestJS + Fastify + TypeScript + Drizzle + PostgreSQL e frontend Next.js 14 App Router + React 18 + TypeScript + React Query + Axios + Zustand + Jotai + Zod

## Problema

O WorkCycle ainda nao enxerga compromissos externos de agenda como parte do fluxo operacional diario. Na pratica, o usuario precisa alternar entre multiplas abas e multiplas contas do Google Calendar para descobrir quanto tempo realmente tem disponivel antes de planejar o ciclo de trabalho.

Esse desencaixe quebra a proposta central do produto: o ciclo diario e montado com base em horas disponiveis, mas hoje essas horas nao consideram reunioes e bloqueios vindos do calendario externo. O resultado e planejamento manual, retrabalho para recalcular disponibilidade e risco de superalocacao.

Este epic existe para transformar agenda externa em dado operacional do WorkCycle, sem tentar substituir toda a complexidade de um calendario corporativo. A entrega precisa cobrir tres necessidades ao mesmo tempo:

- centralizar leitura e manutencao dos eventos em uma rota dedicada `/agenda`
- projetar os proximos eventos do dia diretamente em `/hoje` e `/semana`
- permitir uma integracao semi-ativa com o ciclo, na qual reunioes aprovadas pelo usuario descontam horas disponiveis e podem ser vinculadas a projetos

A prioridade nao e sincronizacao em tempo real nem colaboracao multiusuario. A prioridade e um fluxo confiavel, recuperavel e independente por conta Google, no qual o usuario controla o que entra no planejamento e o que deve ser ignorado ou silenciado permanentemente.

## Usuarios

| Perfil | Descricao | Principal necessidade |
|--------|-----------|----------------------|
| Usuario individual do WorkCycle | Pessoa que organiza o proprio dia e a propria semana dentro do produto | Ver compromissos externos sem sair do WorkCycle e montar o ciclo com horas reais disponiveis |
| Usuario com multiplas contas Google | Pessoa que separa agenda pessoal, profissional ou clientes em contas diferentes | Gerenciar contas e calendarios de forma independente, sem misturar permissoes, estados de erro ou decisoes de inclusao |
| Usuario orientado a projetos | Pessoa que precisa relacionar reunioes com entregas e carteira ativa | Aprovar reunioes relevantes, vincula-las a projetos e descontar seu tempo do ciclo com rastreabilidade minima |

## Visao de Sucesso

- [ ] Os eventos do dia ficam visiveis em `/hoje` sem depender de abas externas do Google Calendar
- [ ] `/semana` exibe um widget lateral minimalista com proximos eventos do dia usando a mesma fonte de agenda operacional
- [ ] A rota `/agenda` permite criar, editar, listar e excluir eventos com reflexo confirmado no Google Calendar
- [ ] Reunioes aprovadas pelo usuario descontam horas disponiveis do ciclo e podem ser vinculadas a um projeto existente
- [ ] Eventos recorrentes irrelevantes podem ser silenciados permanentemente sem reaparecer como ruido operacional
- [ ] Multiplas contas Google sao gerenciadas de forma independente, inclusive quando uma delas falha, expira token ou e desativada
- [ ] O toggle por calendario em Configuracoes/Integracoes controla quais calendarios alimentam widgets e contabilizacao do ciclo
- [ ] O produto continua utilizavel mesmo sem sync em tempo real, com estado degradado explicito e caminhos de recuperacao claros

## Escopo

### Dentro do Escopo

- Criar a rota dedicada `/agenda` no frontend, integrada a navegacao principal, para operar eventos de agenda no contexto do WorkCycle
- Entregar CRUD completo de eventos na `/agenda` com integracao write-through ao Google Calendar:
  - listar eventos do intervalo carregado
  - criar evento em calendario selecionado
  - editar evento existente
  - excluir evento existente
  - refletir o resultado confirmado pelo Google antes de consolidar sucesso para o usuario
- Reaproveitar a base ja existente de autenticacao e vinculacao Google para suportar OAuth 2.0 multi-conta
- Evoluir a pagina `/configuracoes` para uma area explicita de Integracoes com:
  - visao das contas Google ja vinculadas
  - fluxo de conexao de novas contas
  - gestao independente por conta
  - toggle por calendario usando a base `google_calendars.is_included`
- Reaproveitar a persistencia ja existente em `google_accounts`, `google_calendars`, `calendar_events` e `event_accounting_statuses`
- Expandir o modulo backend de `events` para deixar de ser apenas listagem basica e passar a ser a fronteira oficial de:
  - leitura de eventos por intervalo e por conta/calendario
  - criacao, edicao e exclusao
  - sync sob demanda com Google Calendar
  - reconciliacao basica entre estado remoto e snapshot local
- Expandir o dominio de contabilizacao para usar os statuses ja existentes em `event_accounting_statuses`:
  - `pending`
  - `approved`
  - `ignored`
  - `silenced`
- Integrar agenda ao dominio de ciclo de forma semi-ativa:
  - eventos entram inicialmente como observacao operacional
  - apenas reunioes aprovadas pelo usuario impactam horas disponiveis
  - uma aprovacao pode opcionalmente vincular a reuniao a um projeto existente
  - o ciclo consome minutos aprovados, mas nao passa a ser dono do evento
- Exibir widget lateral minimalista em `/hoje` e `/semana` com os proximos eventos do dia
- Garantir que o widget e o calculo do ciclo respeitem:
  - multiplas contas
  - calendarios incluidos/excluidos
  - silenciamentos permanentes
  - estados de erro por conta
  - timezone persistido do usuario quando aplicavel
- Prever fluxos de recuperacao para:
  - token expirado de uma conta
  - falha parcial de sync em um calendario
  - evento remoto alterado ou removido apos ter sido aprovado
  - duplicidade ou ruido gerado por recorrencia
- Manter o escopo centrado em uso individual, sem introduzir colaboracao entre usuarios do WorkCycle

### Fora do Escopo

- Push notifications
- Webhooks ou push sync em tempo real do Google Calendar
- Integracoes com Outlook Calendar ou Apple Calendar
- Multiusuario, colaboracao compartilhada ou agendas de equipe
- Regras automaticas de aprovacao de reunioes sem acao explicita do usuario
- Planejamento automatico do ciclo a partir da agenda sem confirmacao humana
- Analytics avancado de agenda alem do impacto operacional no dia e na semana
- Sincronizacao offline-first

## Contexto Tecnico

- **Stack:**
  - Backend: NestJS, Fastify, TypeScript, Drizzle, PostgreSQL
  - Frontend: Next.js App Router, React 18, TypeScript, React Query, Axios, Zustand, Jotai, Zod
- **Reaproveitamento ja confirmado no codigo:**
  - frontend ja possui rotas `/hoje`, `/semana` e `/configuracoes`
  - frontend ja possui `AppNavigation`, hoje com Dashboard, Hoje, Semana, Tarefas e Projetos
  - frontend ja possui `AuthSettingsWorkspace`, `authService.getGoogleLinkUrl()` e listagem de contas via `/api/accounts`
  - backend ja possui modulos `auth`, `accounts`, `events`, `cycle` e `projects`
  - backend ja possui as tabelas `google_accounts`, `google_calendars`, `calendar_events` e `event_accounting_statuses`
  - `event_accounting_statuses` ja suporta `pending`, `approved`, `ignored` e `silenced`
  - `calendar_events` ja preve campos uteis para agenda operacional e sync, incluindo recorrencia, attendees, timestamps com timezone, vinculo opcional com projeto e marca de sync
- **Lacunas reais a implementar:**
  - nao existe rota `/agenda` no frontend
  - `AppNavigation` ainda nao expoe Agenda
  - nao existe modulo frontend dedicado de agenda com query hooks, service e estado operacional proprios
  - `AuthSettingsWorkspace` ainda lista contas, mas nao entrega gestao de calendarios por conta nem toggle de inclusao
  - o backend de `events` hoje so expoe listagem basica e nao cobre CRUD nem sync completo com Google Calendar
  - o backend de `accounting` hoje nao e a fronteira completa de decisao operacional do ciclo sobre eventos
  - nao ha widget lateral de agenda em `/hoje` e `/semana`
  - o ciclo ainda nao consome reunioes aprovadas como desconto operacional de disponibilidade
- **Fronteiras de dominio mandatorias:**
  - `auth` e `accounts` continuam donos de OAuth, tokens, contas conectadas e calendarios disponiveis por conta
  - `events` passa a ser dono do snapshot local dos eventos, do CRUD proxy ao Google Calendar e da reconciliacao remota
  - `accounting` passa a ser dono das decisoes do usuario sobre relevancia operacional do evento por data
  - `cycle` consome apenas o resultado aprovado da contabilizacao para ajustar horas disponiveis; nao passa a editar eventos externos
  - `projects` continua sendo source of truth dos projetos que podem ser associados a reunioes aprovadas
  - no frontend, `/agenda` deve ser pagina de composicao e o dominio deve viver em `modules/agenda/`
- **Integracoes externas:**
  - Google OAuth 2.0 para conexao multi-conta
  - Google Calendar API para leitura e escrita de eventos
- **Dependencias de entrega:**
  - gestao de contas e calendarios em Configuracoes precisa existir antes de a agenda operar com multiplas contas de forma previsivel
  - leitura consistente de eventos precisa anteceder o desconto de horas no ciclo
  - vinculo com projetos depende do catalogo de projetos ja integrado
  - a logica de aprovacao, ignorar e silenciar precisa ser consolidada antes de o widget de `/hoje` e `/semana` ser tratado como dado operacional confiavel
- **Restricoes operacionais:**
  - sem webhooks, a atualizacao sera dirigida por abertura de tela, acao explicita do usuario ou refresh manual
  - falha de uma conta Google nao pode bloquear leitura das demais
  - alteracoes em eventos so podem ser consideradas concluidas apos resposta confirmada do Google
  - calendarios excluidos via toggle nao devem contaminar widget nem contabilizacao do ciclo
  - eventos recorrentes precisam de tratamento de serie e de ocorrencia para evitar ruido ou silenciamento incorreto
- **Edge cases obrigatorios do epic:**
  - reuniao recorrente silenciada deve deixar de aparecer nas proximas ocorrencias relevantes, sem apagar historico ja resolvido
  - evento remoto removido ou movido apos aprovacao precisa acionar reconciliacao e revisao do desconto no ciclo
  - token expirado de uma conta deve marcar apenas aquela conta como degradada e oferecer reconexao
  - nomes de calendarios iguais em contas distintas nao podem causar confusao de identificacao
  - eventos de multiplos calendarios no mesmo horario nao podem gerar desconto em duplicidade por erro de reconciliacao local
  - estados vazios, loading, stale e erro precisam existir em `/agenda`, `/hoje`, `/semana` e `/configuracoes`

## Riscos & Suposicoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| CRUD local marcar sucesso antes da confirmacao do Google e gerar divergencia entre WorkCycle e calendario externo | Alto | adotar write-through com confirmacao remota, rollback visual em erro e refresh seletivo do calendario afetado |
| Expiracao de token em uma conta Google degradar toda a experiencia multi-conta | Alto | isolar estado por conta, mostrar erro localizado e permitir reconexao sem interromper outras contas |
| Recorrencias serem silenciadas com chave errada e esconderem eventos indevidos | Alto | definir semantica explicita de silenciamento por serie quando houver `recurringEventId` e fallback controlado quando nao houver |
| Reunioes aprovadas descontarem horas em duplicidade no ciclo | Alto | centralizar o desconto no read model de contabilizacao por data e usar idempotencia sobre `event_id + date` |
| Evento aprovado ser alterado ou excluido externamente e o ciclo continuar com horas incorretas | Alto | executar reconciliacao na proxima leitura ou sync e sinalizar revisao do impacto no ciclo |
| Timezone do usuario e timezone do evento divergirem e deslocarem reunioes para o dia errado | Alto | normalizar bucket diario com timestamps timezone-aware e regra unica de data operacional |
| Toggle por calendario nao refletir de forma consistente entre agenda, widget e ciclo | Medio | tratar `isIncluded` como filtro unico para fontes operacionais e invalidar caches relacionados de forma coordenada |
| Sem sync em tempo real, usuario operar com agenda defasada sem perceber | Medio | exibir indicador de atualizacao, acao explicita de refresh e timestamp de ultima sincronizacao por conta ou calendario |
| Vinculo opcional com projeto introduzir friccao excessiva na aprovacao de reuniao | Medio | manter aprovacao simples, com associacao de projeto opcional e editavel depois |
| Base existente de events e accounting induzir a implementacao a reutilizar contratos insuficientes | Medio | explicitar no Core Flow a expansao de contratos e responsabilidades em vez de acoplar UI ao repositorio atual de listagem basica |

## Suposicoes explicitas

- A integracao com agenda neste epic e semi-ativa: o WorkCycle sugere leitura operacional, mas o desconto no ciclo so ocorre apos aprovacao explicita do usuario
- O snapshot local em `calendar_events` continua existindo como camada de performance, reconciliacao e leitura operacional, mas o Google Calendar segue como fonte externa de escrita e verdade remota do evento
- O toggle por calendario determina quais calendarios alimentam widgets e contabilizacao; contas conectadas permanecem independentes entre si
- O vinculo entre reuniao aprovada e projeto usa projetos ja existentes no dominio de `projects`, sem criacao de projeto a partir da agenda
- A ausencia de webhooks e aceitavel para o MVP desde que haja refresh manual e sincronizacao orientada por abertura de tela
- O usuario alvo e individual; nao havera regras de compartilhamento, permissao por equipe ou ownership entre multiplos usuarios do produto

## Perguntas em Aberto

- [ ] Eventos de dia inteiro entram apenas como contexto visual ou tambem podem ser aprovados para desconto no ciclo?
- [ ] Para recorrencias sem `recurringEventId` consistente vindo do Google, qual deve ser a regra de silenciamento permanente aceitavel no MVP?
- [ ] Quando um evento ja aprovado for editado externamente e mudar duracao, o sistema deve recalcular automaticamente o desconto no proximo sync ou exigir revisao manual do usuario?
- [ ] A rota `/agenda` precisa nascer com apenas visao cronologica operacional ou ja deve incluir uma grade visual de calendario no MVP inicial?
- [ ] O usuario podera mover um evento entre calendarios conectados no CRUD inicial, ou isso fica fora do primeiro corte?
- [ ] Existe configuracao de timezone do usuario ja persistida e pronta para consumo transversal, ou o epic precisa prever alinhamento adicional desse contrato para agenda e ciclo?

---
*Gerado por PLANNER — Fase 1/3*