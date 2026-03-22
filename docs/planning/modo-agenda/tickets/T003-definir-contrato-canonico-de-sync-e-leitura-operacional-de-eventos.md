# [T003] Definir contrato canonico de sync e leitura operacional de eventos

> **Tipo:** RFCT | **Tamanho:** M (3pts) | **Fluxo:** CF-02  
> **Depende de:** T001 | **Bloqueia:** T004, T005  
> **Assignee:** - | **Status:** Backlog

## Contexto
O backend ja possui `calendar_events` e um modulo `events`, mas a implementacao atual e apenas uma listagem basica. Antes de expandir sync, reconciliacao e CRUD write-through, o produto precisa fechar um contrato canonico para leitura operacional por intervalo e refresh manual.

## O que fazer
Definir os contratos de API, DTOs e regras de reconciliacao minima para eventos operacionais, contemplando janela temporal, filtros por conta/calendario e estado de sync.

### Arquivos esperados / impactados
- `backend/src/modules/events/controllers/events.controller.ts` - modificar
- `backend/src/modules/events/services/events-finder.service.ts` - modificar
- `backend/src/modules/events/repositories/events.repository.ts` - modificar
- `backend/src/modules/events/use-cases/list-calendar-events.use-case.ts` - modificar
- `backend/src/modules/events/` - criar schemas ou tipos de DTO, se necessario
- `backend/src/shared/database/schema/events.schema.ts` - revisar apenas se o contrato exigir campos adicionais

## Criterios de Aceite

- [ ] Existe definicao explicita de leitura de eventos por intervalo com filtros de conta e calendario
- [ ] O contrato deixa claro como o frontend dispara refresh ou sync manual
- [ ] O payload de leitura contem os campos necessarios para `/agenda`, widgets e accounting
- [ ] O contrato define como representar degradacao parcial por conta ou calendario
- [ ] A estrategia de chave para recorrencia e reconciliacao fica explicitada no nivel do contrato
- [ ] O documento ou comentarios de implementacao deixam claro o que fica fora do primeiro corte

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface ListCalendarEventsInputDTO {
  from: string;
  to: string;
  accountIds?: string[];
  calendarIds?: string[];
  refresh?: boolean;
}

interface CalendarEventListItemDTO {
  id: string;
  calendarId: string;
  title: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  recurringEventId?: string | null;
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
}
```

### Regras de Negocio
- Leitura operacional deve partir apenas de calendarios marcados como incluidos.
- O contrato deve prever uso sem webhooks e com refresh manual.

### Edge Cases
- [ ] Intervalo cruza boundary de dia operacional
- [ ] Conta falha durante refresh, mas outra devolve dados validos
- [ ] Evento removido remotamente entre duas leituras consecutivas

## Notas de Implementacao
Este ticket fecha o contrato. A implementacao completa de sync e CRUD fica para tickets seguintes.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
