# [T003] Implementar CRUD write-through de eventos no backend

> **Tipo:** API | **Tamanho:** L (5pts) | **Fluxo:** CF-03  
> **Depende de:** T002 | **Bloqueia:** T004  
> **Assignee:** - | **Status:** Backlog

## Objetivo
Entregar no backend o CRUD write-through de eventos para que o WorkCycle so confirme create, update e delete depois da resposta do Google Calendar e mantenha `calendar_events` coerente com o remoto.

## Escopo desta entrega

### Backend
- `events` continua dono exclusivo do CRUD de eventos externos.
- A controller de `events` deve expor operacoes de create, update e delete com validacao de calendario alvo e escopo da conta.
- A persistencia local deve usar o payload remoto confirmado como fonte canonica da operacao.

### Fora desta entrega
- Nao inclui UI da rota `/agenda`; isso fica em T004.
- Nao inclui accounting nem impacto no ciclo.

## Contratos esperados

### Responsabilidades de endpoint
- `POST /events` cria um evento em um calendario permitido e retorna o snapshot confirmado.
- `PATCH /events/:id` atualiza um evento existente no Google Calendar e reflete localmente apenas a versao confirmada.
- `DELETE /events/:id` remove o evento remotamente e reconcilia o snapshot local sem deixar item fantasma no read model.
- Se a controller atual usar convencoes de path diferentes, manter os paths existentes e garantir as mesmas responsabilidades.

### DTO minimo esperado
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

## Arquivos esperados / impactados
- `backend/src/modules/events/controllers/events.controller.ts`
- `backend/src/modules/events/services/events-remote-writer.service.ts`
- `backend/src/modules/events/services/events-writer.service.ts`
- `backend/src/modules/events/repositories/events.repository.ts`
- `backend/src/modules/events/use-cases/create-calendar-event.use-case.ts`
- `backend/src/modules/events/use-cases/update-calendar-event.use-case.ts`
- `backend/src/modules/events/use-cases/delete-calendar-event.use-case.ts`
- `backend/src/modules/events/events.schemas.ts`
- `backend/src/modules/events/events.module.ts`
- `backend/src/modules/events/use-cases/create-calendar-event.use-case.spec.ts`
- `backend/src/modules/events/use-cases/delete-calendar-event.use-case.spec.ts`
- `backend/src/modules/events/types/event.ts` se o read model confirmado precisar ser alinhado

## Criterios de aceite
- [ ] Existem endpoints equivalentes a `POST /events`, `PATCH /events/:id` e `DELETE /events/:id` no modulo `events`.
- [ ] Create e update validam que o calendario alvo pertence a uma conta acessivel e operacionalmente permitida.
- [ ] O snapshot local so e criado, atualizado ou removido depois da confirmacao remota do Google.
- [ ] Falha remota retorna erro padronizado e nao deixa sucesso silencioso nem mutacao parcial em `calendar_events`.
- [ ] Delete de evento volta a ser refletido corretamente na leitura por intervalo entregue por T002.
- [ ] Se o Google aceitar a operacao mas a persistencia local falhar, a API nao retorna sucesso limpo; deixa caminho claro de refresh/retry para recompor o snapshot.
- [ ] Existem testes cobrindo sucesso, calendario nao permitido, falha remota, evento inexistente e persistencia local falhando apos confirmacao remota.

## Edge cases obrigatorios
- [ ] Google confirma create ou update e a persistencia local falha em seguida.
- [ ] Delete de evento ja removido remotamente nao deixa a tela presa em erro inconsistente.
- [ ] Update em evento de conta degradada precisa falhar de forma explicita.
- [ ] Troca de calendario entre contas deve ser explicitamente bloqueada se nao suportada no primeiro corte.

## Nao faz parte
- Criar formularios ou UX na rota `/agenda`.
- Aprovar, ignorar ou silenciar eventos.
- Recalcular ciclo.

## Notas de implementacao
- Preferir reaproveitar `events-remote-writer.service.ts` e `events-writer.service.ts` ja existentes, evitando duplicar responsabilidade de escrita remota.
- O contrato de erro precisa diferenciar falha remota de falha local pos-confirmacao para que o frontend possa orientar refresh sem inventar estado.
- Calendarios excluidos por toggle nao devem ser alvo operacional padrao para create.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
