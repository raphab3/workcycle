# [T004] Implementar sync, snapshot e reconciliacao de eventos no backend

> **Tipo:** API | **Tamanho:** L (5pts) | **Fluxo:** CF-02  
> **Depende de:** T003 | **Bloqueia:** T005, T006, T008, T009  
> **Assignee:** - | **Status:** Backlog

## Contexto
Depois de fechar o contrato, o modulo `events` precisa sair da listagem estatica e passar a sincronizar eventos reais do Google Calendar, mantendo snapshot local e reconciliando mudancas remotas de forma idempotente.

## O que fazer
Implementar no backend a leitura remota por conta/calendario, o upsert em `calendar_events` e a reconciliacao minima para atualizacoes e remocoes remotas dentro da janela operacional.

### Arquivos esperados / impactados
- `backend/src/modules/events/controllers/events.controller.ts` - modificar
- `backend/src/modules/events/services/events-finder.service.ts` - modificar
- `backend/src/modules/events/services/` - criar service de sync e reconciliacao
- `backend/src/modules/events/repositories/events.repository.ts` - modificar
- `backend/src/modules/events/use-cases/list-calendar-events.use-case.ts` - modificar
- `backend/src/modules/events/use-cases/` - criar use case de refresh, se necessario
- `backend/src/modules/events/events.module.ts` - modificar
- `backend/src/shared/database/schema/events.schema.ts` - modificar apenas se a reconciliacao precisar de metadata adicional

## Criterios de Aceite

- [ ] O backend consegue sincronizar eventos de calendarios incluidos dentro de um intervalo informado
- [ ] `calendar_events` passa a refletir upsert consistente dos dados remotos relevantes
- [ ] Remocoes ou alteracoes remotas sao reconciliadas sem duplicar eventos locais
- [ ] Falha parcial de uma conta ou calendario nao impede retorno dos demais dados
- [ ] O endpoint de leitura por intervalo devolve eventos ordenados e aptos para uso no frontend
- [ ] Testes de service ou repository cobrem upsert, reconciliacao e falha parcial
- [ ] Sem regressao no modulo atual de events

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface EventSyncResultDTO {
  events: CalendarEventListItemDTO[];
  degradedSources: Array<{
    accountId: string;
    calendarId?: string;
    reason: string;
  }>;
}
```

### Regras de Negocio
- Sync manual deve ser idempotente para a mesma janela temporal.
- Snapshot local e camada operacional; nao substitui a verdade remota do Google.

### Edge Cases
- [ ] Evento recorrente muda apenas uma ocorrencia
- [ ] Evento all-day chega com timezone diferente do usuario
- [ ] Conta expirada no meio da sincronizacao

## Notas de Implementacao
Nao misturar neste ticket a escrita remota de CRUD. O foco aqui e consolidar leitura, snapshot e reconciliacao.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
