# [T002] Implementar leitura operacional, sync e reconciliacao de eventos

> **Tipo:** API | **Tamanho:** L (5pts) | **Fluxo:** CF-02  
> **Depende de:** T001 | **Bloqueia:** T003, T004, T005, T006  
> **Assignee:** - | **Status:** Backlog

## Objetivo
Entregar no backend a fonte operacional confiavel de eventos para o Modo Agenda: leitura por intervalo, refresh manual e reconciliacao idempotente do snapshot local com Google Calendar, sem webhooks.

## Escopo desta entrega

### Backend
- `events` passa a ser a fronteira oficial de leitura operacional por intervalo.
- `events` passa a oferecer um contrato explicito de sync manual para telas que precisem atualizar a janela corrente.
- `events` passa a reconciliar criacoes, updates e remocoes remotas no snapshot local sem duplicidade e com degradacao localizada por conta/calendario.

### Fora desta entrega
- Nao inclui create, update ou delete iniciados pelo usuario; isso fica em T003.
- Nao inclui accounting ou impacto no ciclo.

## Contratos esperados

### Responsabilidades de endpoint
- `GET /events` ou rota equivalente em `events.controller.ts` deve receber uma janela temporal e retornar o read model operacional da agenda.
- `POST /events/sync` ou rota equivalente deve disparar refresh explicito para a mesma janela, retornando o resultado consolidado e as fontes degradadas.
- Se a controller atual ja usar outra convencao de path, preservar o path existente e garantir estas responsabilidades.

### DTO minimo esperado
```typescript
interface ListCalendarEventsInputDTO {
  from: string;
  to: string;
  accountIds?: string[];
  calendarIds?: string[];
}

interface AgendaEventReadDTO {
  id: string;
  accountId: string;
  calendarId: string;
  title: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  recurringEventId?: string | null;
  status: 'confirmed' | 'tentative' | 'cancelled';
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  lastSyncedAt: string | null;
}

interface EventSyncResultDTO {
  events: AgendaEventReadDTO[];
  degradedSources: Array<{
    accountId: string;
    calendarId?: string;
    reason: string;
  }>;
}
```

## Arquivos esperados / impactados
- `backend/src/modules/events/controllers/events.controller.ts`
- `backend/src/modules/events/services/events-finder.service.ts`
- `backend/src/modules/events/services/events-sync.service.ts`
- `backend/src/modules/events/repositories/events.repository.ts`
- `backend/src/modules/events/use-cases/list-calendar-events.use-case.ts`
- `backend/src/modules/events/events.schemas.ts`
- `backend/src/modules/events/events.module.ts`
- `backend/src/modules/events/types/event.ts`
- `backend/src/modules/events/services/events-sync.service.spec.ts`
- `backend/src/modules/events/use-cases/list-calendar-events.use-case.spec.ts`
- `backend/src/shared/database/schema/events.schema.ts` somente se faltar metadata operacional ja prevista no epic

## Criterios de aceite
- [ ] Existe leitura de eventos por intervalo usando apenas calendarios incluidos e retornando dados suficientes para `/agenda`, widgets e accounting.
- [ ] Existe refresh manual por contrato explicito, sem depender de abrir outra rota ou de efeitos colaterais ocultos.
- [ ] O snapshot local em `calendar_events` e atualizado por upsert idempotente para criacoes e alteracoes remotas.
- [ ] Eventos removidos ou cancelados remotamente sao reconciliados sem deixar duplicidade local nem sumir silenciosamente quando houver historico relevante.
- [ ] Falha parcial de uma conta ou calendario nao impede retorno dos demais dados e fica representada em `degradedSources`.
- [ ] Recorrencias e ocorrencias isoladas nao geram duplicidade no read model retornado.
- [ ] Existem testes cobrindo sync inicial, sync incremental, alteracao remota, remocao remota, recorrencia e degradacao parcial.

## Edge cases obrigatorios
- [ ] Janela consultada cruza o boundary operacional do dia e ainda retorna os eventos no bucket correto.
- [ ] Evento all-day nao muda de dia por erro de timezone.
- [ ] Uma ocorrencia recorrente muda sem alterar a serie inteira.
- [ ] A conta expira durante o refresh e apenas aquela fonte fica degradada.

## Nao faz parte
- Endpoints de create, update e delete de eventos.
- Decisao operacional de `approved`, `ignored` e `silenced`.
- Desconto no ciclo.

## Notas de implementacao
- A reconciliacao precisa ser idempotente por identificador remoto do evento dentro da combinacao conta/calendario, nao por ordem de chegada do sync.
- Quando houver historico de accounting associado, a reconciliacao nao deve apagar evidencias necessarias para revisao futura.
- Este ticket deve reutilizar a base existente de `events.repository.ts`, `events-sync.service.ts` e `list-calendar-events.use-case.ts` em vez de criar um segundo fluxo paralelo de leitura.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
