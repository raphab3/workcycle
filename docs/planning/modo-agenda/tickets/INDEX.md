# Tickets - Modo Agenda

## Resumo
- **Total:** 8 tickets | **Estimativa total:** 38 pontos
- **Epic:** [../epic.md](../epic.md)
- **Core Flow:** [../core-flow.md](../core-flow.md)
- **Checkpoint atual:** decomposicao revisada para reduzir handoffs e tickets de contrato sem entrega observavel
- **Proximo ticket sugerido:** T001 - Entregar Integracoes Google multi-conta e toggle por calendario

## Criterios usados na revisao
- juntar tickets que so fazem sentido quando backend e frontend avancam juntos
- remover tickets de definicao de contrato sem entrega funcional independente
- preservar dependencia tecnica real entre `accounts`, `events`, `accounting`, `cycle` e frontend
- manter tamanho maximo em torno de slices executaveis por fluxo, evitando microtickets artificiais

## Por Fluxo

### CF-01: Conexao Google multi-conta e selecao operacional de calendarios

| ID | Titulo | Tipo | Tamanho | Depende de | Status |
|----|--------|------|---------|------------|--------|
| T001 | Entregar Integracoes Google multi-conta e toggle por calendario | FEAT | L | - | Backlog |

### CF-02: Snapshot local de eventos e reconciliacao com Google Calendar

| ID | Titulo | Tipo | Tamanho | Depende de | Status |
|----|--------|------|---------|------------|--------|
| T002 | Implementar leitura operacional, sync e reconciliacao de eventos | API | L | T001 | Backlog |

### CF-03: Rota /agenda com leitura por intervalo e CRUD write-through

| ID | Titulo | Tipo | Tamanho | Depende de | Status |
|----|--------|------|---------|------------|--------|
| T003 | Implementar CRUD write-through de eventos no backend | API | L | T002 | Backlog |
| T004 | Entregar rota `/agenda` com navegacao, leitura por intervalo e CRUD | FEAT | L | T001, T002, T003 | Backlog |

### CF-04: Widgets de proximos eventos em /hoje e /semana

| ID | Titulo | Tipo | Tamanho | Depende de | Status |
|----|--------|------|---------|------------|--------|
| T005 | Exibir widget lateral de agenda em Hoje e Semana | FEAT | M | T002, T004 | Backlog |

### CF-05: Decisao operacional sobre eventos e fila de contabilizacao

| ID | Titulo | Tipo | Tamanho | Depende de | Status |
|----|--------|------|---------|------------|--------|
| T006 | Entregar accounting operacional de eventos ponta a ponta | FEAT | L | T002, T004, T005 | Backlog |

### CF-06: Desconto de horas aprovadas no ciclo diario

| ID | Titulo | Tipo | Tamanho | Depende de | Status |
|----|--------|------|---------|------------|--------|
| T007 | Integrar impacto aprovado da agenda ao ciclo ponta a ponta | FEAT | L | T006 | Backlog |

### Fechamento do Epic

| ID | Titulo | Tipo | Tamanho | Depende de | Status |
|----|--------|------|---------|------------|--------|
| T008 | Validar fluxo ponta a ponta e cobertura de regressao do Modo Agenda | TEST | L | T001, T004, T005, T006, T007 | Backlog |

## Ordem de Implementacao

```mermaid
graph LR
    T001 --> T002
    T002 --> T003
    T001 --> T004
    T002 --> T004
    T003 --> T004
    T002 --> T005
    T004 --> T005
    T002 --> T006
    T004 --> T006
    T005 --> T006
    T006 --> T007
    T001 --> T008
    T004 --> T008
    T005 --> T008
    T006 --> T008
    T007 --> T008
```

## Consolidacoes realizadas

- T001 antigo + T002 antigo viraram um unico slice vertical de Integracoes
- T003 antigo foi absorvido por T002 para eliminar ticket de contrato sem entrega funcional
- T006 antigo + T007 antigo viraram um unico ticket da rota `/agenda`
- T009 antigo + T010 antigo viraram um unico ticket de accounting ponta a ponta
- T011 antigo + T012 antigo viraram um unico ticket de impacto no ciclo ponta a ponta

## Motivo da reducao

O plano anterior estava correto em cobertura, mas fragmentado demais para uma feature fortemente encadeada. A nova divisao reduz esperas entre backend e frontend, evita tickets que apenas preparam contrato sem liberar comportamento e deixa cada etapa com um resultado validavel no produto.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
