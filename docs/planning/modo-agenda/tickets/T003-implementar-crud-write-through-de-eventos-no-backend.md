# [T003] Implementar CRUD write-through de eventos no backend

> **Tipo:** API | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T002 | **Bloqueia:** T004  
> **Assignee:** - | **Status:** Backlog

## Contexto
Depois de a leitura operacional existir, o backend precisa permitir que o WorkCycle crie, edite e exclua eventos sem confirmar sucesso local antes da resposta do Google Calendar.

## O que fazer
Implementar os endpoints de criacao, edicao e exclusao de eventos com estrategia write-through, atualizando `calendar_events` apenas apos confirmacao remota.

### Arquivos esperados / impactados
- `backend/src/modules/events/controllers/events.controller.ts` - modificar
- `backend/src/modules/events/services/` - criar service de escrita remota
- `backend/src/modules/events/repositories/events.repository.ts` - modificar
- `backend/src/modules/events/use-cases/` - criar use cases de create, update e delete
- `backend/src/modules/events/events.module.ts` - modificar
- `backend/src/modules/events/` - criar schemas de payload, se necessario

## Criterios de Aceite

- [ ] Existem endpoints `POST /events`, `PATCH /events/:id` e `DELETE /events/:id`
- [ ] Criacao e edicao validam calendario alvo e escopo da conta autenticada
- [ ] O snapshot local so e atualizado depois da confirmacao do Google Calendar
- [ ] Falha remota retorna erro padronizado sem deixar estado local inconsistente
- [ ] Exclusao e coerente com o contrato de leitura por intervalo
- [ ] Testes cobrem sucesso, falha remota e operacao em calendario nao permitido

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
- Calendarios excluidos por toggle nao devem ser alvo operacional padrao de criacao.
- Troca de calendario entre contas pode permanecer fora do primeiro corte, mas deve ficar explicitamente bloqueada se nao suportada.

### Edge Cases
- [ ] Google confirma create e a persistencia local falha em seguida
- [ ] Delete de evento ja removido remotamente
- [ ] Edit de evento de conta degradada

## Notas de Implementacao
Nao embutir regras de accounting nem desconto no ciclo aqui. O objetivo e fechar a escrita remota de eventos.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
