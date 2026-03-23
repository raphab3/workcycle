# Tickets Aprovados - Modo Agenda

## Contexto
- Iniciativa base: `modo-agenda`
- Fonte obrigatoria validada: `docs/planning/modo-agenda/core-flow.md`
- Epic correspondente: `docs/planning/modo-agenda/epic.md`
- Pacote consolidado: `docs/planning/modo-agenda/tickets/INDEX.md`
- Status: aprovado para refinamento

## Validacao
O CORE FLOW de `modo-agenda` foi validado como suficiente para decomposicao em tickets.

Nao foram encontradas lacunas estruturais bloqueantes. As perguntas em aberto restantes nao impedem refinamento porque ja foram encapsuladas como decisoes de corte do MVP ou edge cases trataveis dentro dos tickets, sem quebrar independencia, dependencias ou criterios de aceite.

Pontos considerados nao bloqueantes:
- lista cronologica versus grade visual de calendario na rota `/agenda`
- regra de silenciamento para recorrencias sem `recurringEventId` consistente
- tratamento de eventos all-day no impacto do ciclo
- revisao automatica versus pendencia explicita para eventos alterados externamente

## Resumo do pacote
- Total de tickets: 8
- Estimativa consolidada: 38 pontos
- Dependencia raiz: `T001`
- Caminho critico principal: `T001 -> T002 -> T003 -> T004 -> T005 -> T006 -> T007 -> T008`

## Tickets aprovados

### T001
**Titulo:** Entregar Integracoes Google multi-conta e toggle por calendario  
**Fluxo:** CF-01  
**Tipo:** FEAT  
**Tamanho:** L  
**Depende de:** -

**Objetivo:**
Entregar o slice completo de integracoes Google, combinando backend e frontend para listar contas, listar calendarios por conta e alternar `isIncluded` por calendario na tela de Configuracoes.

**Resultado esperado:**
- contas Google conectadas visiveis com seus calendarios
- toggle de `isIncluded` refletido sem reload manual
- falhas localizadas por conta
- contratos suficientes para `/agenda`, widgets e accounting

### T002
**Titulo:** Implementar leitura operacional, sync e reconciliacao de eventos  
**Fluxo:** CF-02  
**Tipo:** API  
**Tamanho:** L  
**Depende de:** `T001`

**Objetivo:**
Expandir o modulo `events` para sincronizar eventos por intervalo, manter snapshot local consistente e reconciliar mudancas remotas sem depender de webhooks.

**Resultado esperado:**
- leitura por intervalo consolidada
- refresh manual confiavel
- reconciliacao idempotente
- degradacao localizada por conta/calendario

### T003
**Titulo:** Implementar CRUD write-through de eventos no backend  
**Fluxo:** CF-03  
**Tipo:** API  
**Tamanho:** L  
**Depende de:** `T002`

**Objetivo:**
Entregar criacao, edicao e exclusao de eventos com confirmacao remota no Google Calendar antes de consolidar sucesso no WorkCycle.

**Resultado esperado:**
- `GET/POST/PATCH/DELETE` de eventos no backend
- persistencia local somente apos confirmacao remota
- tratamento de erro sem divergencia silenciosa

### T004
**Titulo:** Entregar rota `/agenda` com navegacao, leitura por intervalo e CRUD  
**Fluxo:** CF-03  
**Tipo:** FEAT  
**Tamanho:** L  
**Depende de:** `T001`, `T002`, `T003`

**Objetivo:**
Entregar a rota `/agenda` completa no frontend, com item de navegacao, estrutura do modulo `agenda`, leitura por intervalo, refresh manual e formularios de create, edit e delete.

**Resultado esperado:**
- rota navegavel `/agenda`
- leitura cronologica por intervalo
- refresh manual
- CRUD real ponta a ponta
- estados de loading, empty, error, stale e success

### T005
**Titulo:** Exibir widget lateral de agenda em Hoje e Semana  
**Fluxo:** CF-04  
**Tipo:** FEAT  
**Tamanho:** M  
**Depende de:** `T002`, `T004`

**Objetivo:**
Levar a agenda operacional para `/hoje` e `/semana` com widgets laterais minimais reutilizando a mesma fonte operacional da agenda.

**Resultado esperado:**
- widget lateral compartilhado
- mesmos filtros operacionais da agenda
- tratamento de vazio, erro e degradacao parcial

### T006
**Titulo:** Entregar accounting operacional de eventos ponta a ponta  
**Fluxo:** CF-05  
**Tipo:** FEAT  
**Tamanho:** L  
**Depende de:** `T002`, `T004`, `T005`

**Objetivo:**
Entregar accounting operacional de eventos de ponta a ponta, incluindo endpoints de decisao no backend e UX de aprovar, ignorar e silenciar no widget e, quando fizer sentido, na rota `/agenda`.

**Resultado esperado:**
- decisoes `approved`, `ignored` e `silenced`
- idempotencia por `event_id + date`
- `approvedMinutes` e `projectId` opcional
- atualizacao visual apos resposta do backend

### T007
**Titulo:** Integrar impacto aprovado da agenda ao ciclo ponta a ponta  
**Fluxo:** CF-06  
**Tipo:** FEAT  
**Tamanho:** L  
**Depende de:** `T006`

**Objetivo:**
Integrar o impacto aprovado da agenda ao dominio `cycle`, incluindo agregacao backend e exibicao frontend do desconto de horas e de revisoes pendentes.

**Resultado esperado:**
- apenas eventos `approved` impactam o ciclo
- calculo idempotente por `event_id + date`
- impacto total e por projeto visivel em `/hoje`
- sinalizacao de revisao quando necessario

### T008
**Titulo:** Validar fluxo ponta a ponta e cobertura de regressao do Modo Agenda  
**Fluxo:** Fechamento do epic  
**Tipo:** TEST  
**Tamanho:** L  
**Depende de:** `T001`, `T004`, `T005`, `T006`, `T007`

**Objetivo:**
Validar o fluxo completo do Modo Agenda com cobertura de regressao nas principais rotas e integracoes entre `accounts`, `events`, `accounting`, `cycle` e frontend.

**Resultado esperado:**
- checklist ponta a ponta do epic validado
- cobertura de regressao dos fluxos principais
- confirmacao de estados degradados e recuperacao

## Ordem sugerida
1. `T001`
2. `T002`
3. `T003`
4. `T004`
5. `T005`
6. `T006`
7. `T007`
8. `T008`

## Orientacao para refinamento
Refinar este pacote mantendo:
- aderencia obrigatoria ao `core-flow.md`
- tickets independentes e executaveis
- criterios de aceite objetivamente testaveis
- dependencias reais entre backend, frontend e integracoes
- edge cases e riscos operacionais sem criar tickets artificiais de contrato

## Arquivos fonte
- `docs/planning/modo-agenda/epic.md`
- `docs/planning/modo-agenda/core-flow.md`
- `docs/planning/modo-agenda/tickets/INDEX.md`
- `docs/planning/modo-agenda/tickets/T001-entregar-integracoes-google-multi-conta-e-toggle-por-calendario.md`
- `docs/planning/modo-agenda/tickets/T002-implementar-leitura-operacional-sync-e-reconciliacao-de-eventos.md`
- `docs/planning/modo-agenda/tickets/T003-implementar-crud-write-through-de-eventos-no-backend.md`
- `docs/planning/modo-agenda/tickets/T004-entregar-rota-agenda-com-navegacao-leitura-por-intervalo-e-crud.md`
- `docs/planning/modo-agenda/tickets/T005-exibir-widget-lateral-de-agenda-em-hoje-e-semana.md`
- `docs/planning/modo-agenda/tickets/T006-entregar-accounting-operacional-de-eventos-ponta-a-ponta.md`
- `docs/planning/modo-agenda/tickets/T007-integrar-impacto-aprovado-da-agenda-ao-ciclo-ponta-a-ponta.md`
- `docs/planning/modo-agenda/tickets/T008-validar-fluxo-ponta-a-ponta-e-cobertura-de-regressao-do-modo-agenda.md`
