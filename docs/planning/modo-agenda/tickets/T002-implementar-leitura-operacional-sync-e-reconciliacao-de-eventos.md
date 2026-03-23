# [T002] Implementar leitura operacional, sync e reconciliacao de eventos

> **Tipo:** API | **Tamanho:** L (5pts) | **Fluxo:** CF-02  
> **Depende de:** T001 | **Bloqueia:** T003, T004, T005, T006  
> **Assignee:** - | **Status:** Backlog

## Contexto
O schema e o modulo `events` ja existem, mas a capacidade atual e insuficiente para o Modo Agenda. O produto precisa de leitura por intervalo, refresh manual, snapshot local confiavel e reconciliacao idempotente com Google Calendar sem depender de webhooks.

## O que fazer
Entregar no backend o contrato e a implementacao de leitura operacional de eventos por intervalo, incluindo sync sob demanda, persistencia em `calendar_events` e reconciliacao de alteracoes ou remocoes remotas.

### Arquivos esperados / impactados
- `backend/src/modules/events/controllers/events.controller.ts` - modificar
- `backend/src/modules/events/services/events-finder.service.ts` - modificar
- `backend/src/modules/events/services/` - criar service de sync e reconciliacao
- `backend/src/modules/events/repositories/events.repository.ts` - modificar
- `backend/src/modules/events/use-cases/list-calendar-events.use-case.ts` - modificar
- `backend/src/modules/events/use-cases/` - criar use case de refresh, se necessario
- `backend/src/modules/events/events.module.ts` - modificar
- `backend/src/shared/database/schema/events.schema.ts` - modificar apenas se faltar metadata operacional essencial

## Criterios de Aceite

- [ ] Existe leitura de eventos por intervalo com filtros coerentes de conta e calendario
- [ ] O frontend pode disparar refresh manual da agenda via contrato explicito
- [ ] O snapshot local em `calendar_events` e atualizado por upsert idempotente
- [ ] Alteracoes e remocoes remotas sao reconciliadas sem duplicidade local
- [ ] Falha parcial de uma conta ou calendario nao impede retorno dos demais dados
- [ ] O payload de leitura contem os campos necessarios para `/agenda`, widgets e accounting
- [ ] Testes cobrem sync, reconciliacao e degradacao parcial

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

interface EventSyncResultDTO {
  events: Array<{
    id: string;
    calendarId: string;
    title: string;
    startAt: string;
    endAt: string;
    isAllDay: boolean;
    recurringEventId?: string | null;
    responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
  degradedSources: Array<{
    accountId: string;
    calendarId?: string;
    reason: string;
  }>;
}
```

### Regras de Negocio
- Leitura operacional usa apenas calendarios marcados como incluidos.
- O contrato precisa ser viavel sem push notifications nem sincronizacao em tempo real.

### Edge Cases
- [ ] Intervalo cruza boundary do dia operacional
- [ ] Evento recorrente muda apenas uma ocorrencia
- [ ] Conta expira durante o refresh

## Notas de Implementacao
Este ticket absorve a antiga fase de contrato para evitar um passo intermediario sem entrega funcional.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
