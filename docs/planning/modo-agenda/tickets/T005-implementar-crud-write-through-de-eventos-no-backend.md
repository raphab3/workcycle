# [T005] Implementar CRUD write-through de eventos no backend

> **Tipo:** API | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T004 | **Bloqueia:** T007  
> **Assignee:** - | **Status:** Backlog

## Contexto
O Modo Agenda precisa permitir criacao, edicao e exclusao de eventos diretamente do WorkCycle, mas sem assumir sucesso local antes de a operacao ser confirmada pelo Google Calendar.

## O que fazer
Implementar no backend os endpoints write-through de eventos, usando o Google Calendar como escrita remota e atualizando `calendar_events` apenas apos confirmacao da operacao externa.

### Arquivos esperados / impactados
- `backend/src/modules/events/controllers/events.controller.ts` - modificar
- `backend/src/modules/events/services/` - criar service de escrita remota
- `backend/src/modules/events/repositories/events.repository.ts` - modificar
- `backend/src/modules/events/use-cases/` - criar use cases de create, update e delete
- `backend/src/modules/events/events.module.ts` - modificar
- `backend/src/modules/events/` - criar schemas de payload, se necessario

## Criterios de Aceite

- [ ] Existem endpoints `POST /events`, `PATCH /events/:id` e `DELETE /events/:id`
- [ ] Criacao e edicao validam o calendario alvo e o escopo da conta autenticada
- [ ] Sucesso so e persistido localmente apos confirmacao do Google Calendar
- [ ] Falha remota retorna erro padronizado sem deixar snapshot inconsistente
- [ ] Exclusao remove ou marca o snapshot local de forma coerente com o contrato de leitura
- [ ] Testes cobrem sucesso, falha remota e tentativa de operar calendario nao permitido
- [ ] Sem regressao no contrato de leitura por intervalo

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface UpsertCalendarEventDTO {
  calendarId: string;
  title: string;
  startAt: string;
  endAt: string;
  description?: string;
  location?: string;
}
```

### Regras de Negocio
- Calendarios excluidos por `isIncluded=false` nao devem ser alvo padrao de criacao operacional.
- O ticket nao precisa assumir troca de calendario entre contas como requisito obrigatorio do primeiro corte.

### Edge Cases
- [ ] Google confirma create mas falha persistencia local em seguida
- [ ] Usuario tenta editar evento de conta desconectada
- [ ] Delete de evento ja removido remotamente

## Notas de Implementacao
Se a troca de calendario entre contas ficar fora do MVP inicial, o contrato deve bloquear isso explicitamente em vez de deixar comportamento implcito.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
