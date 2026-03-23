# [T011] Implementar backend de Today: sessão, pulse e rollover

> **Tipo:** API | **Tamanho:** L (5pts) | **Fluxo:** CF-04  
> **Depende de:** T010 | **Bloqueia:** T012, T013  
> **Assignee:** Copilot | **Status:** Concluído

## Contexto
Com o contrato canônico definido, o backend precisa implementar o domínio Today como fonte real do estado operacional do dia.

## O que fazer
Implementar persistência e endpoints de Today/cycle para sessão diária, pulse tracking, ajustes, fechamento do dia e rollover, incluindo idempotência mínima de pulse e respeito a timezone do usuário.

### Arquivos esperados / impactados
- `backend/src/shared/database/schema/` — criar schemas de `cycleSessions`, `pulseRecords` e estruturas auxiliares
- `backend/src/shared/database/migrations/*` — criar
- `backend/src/modules/cycle/controllers/cycle.controller.ts` — modificar
- `backend/src/modules/cycle/services/` — criar ou modificar
- `backend/src/modules/cycle/use-cases/` — criar ou modificar

## Critérios de Aceite

- [x] Existem endpoints para obter sessão, atualizar sessão, registrar pulse e consultar registros relevantes
- [x] Sessão diária pode ser retomada após reload e troca de dispositivo
- [x] `pulse` possui proteção mínima contra duplicidade indevida
- [x] Timezone e boundary do dia respeitam settings persistidos
- [x] Fechamento do dia e rollover persistem estado suficiente para o próximo fluxo
- [x] Testes de contrato e regras principais foram adicionados
- [x] Sem regressão nos testes executados no escopo alterado

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface FirePulseInputDTO {
  sessionId: string;
  minutesConfirmed: number;
  recordedAt: string;
}
```

### Regras de Negócio
- A sessão do dia não pode depender exclusivamente do dispositivo atual.
- O estado persistido precisa ser suficiente para hidratar Today e alimentar Weekly.

### Edge Cases
- [ ] Pulse duplicado em janela curta
- [ ] Sessão inexistente sendo atualizada
- [ ] Boundary mudando por timezone atualizado do usuário

## Notas de Implementação
Se necessário, separar use cases por leitura de sessão, mutação de sessão e fechamento/rollover para evitar concentração excessiva de lógica.

## Entrega
- O módulo `cycle` passou a expor endpoints autenticados para o domínio Today:
  - `GET /cycle/session`
  - `PATCH /cycle/session`
  - `POST /cycle/pulse`
  - `GET /cycle/pulse-records`
- Foi criada persistência dedicada para `pulse_records` e `cycle_time_blocks`, além da extensão de `cycle_sessions` com snapshot e metadados de rollover.
- A resolução do dia operacional agora usa `timezone` e `cycleStartHour` vindos de Settings para definir `cycleDate`, `boundaryStartsAt` e janela de rollover.
- O backend cria a sessão do dia sob demanda e faz rollover automático quando detecta virada de boundary com sessão anterior ainda aberta.
- A proteção mínima contra duplicidade de pulse foi implementada por `windowKey` único por sessão, agrupando eventos na janela canônica de 30 minutos.

## Implementação Realizada
- Criado `backend/src/shared/database/schema/cycle.schema.ts` com `cycle_time_blocks` e `pulse_records`.
- Estendido `backend/src/shared/database/schema/tasks.schema.ts` para guardar `snapshot`, `previousCycleDate`, `rolloverTriggeredAt`, `rolloverStrategy` e notices de rollover em `cycle_sessions`.
- Gerada migration `backend/src/shared/database/migrations/0005_chilly_sir_ram.sql` com snapshot correspondente em `meta/0005_snapshot.json`.
- Criados repository, helpers e use cases do `cycle` para leitura da sessão, atualização da sessão, registro/upsert de pulse e listagem de pulse records.
- A montagem do `TodaySessionDTO` passou a derivar `closeDayReview`, `regularization`, `activePulse`, `taskScope` e `operationalBoundary` do estado persistido.

## Validação
- `pnpm db:generate`
- `pnpm exec tsx --test src/modules/cycle/**/*.spec.ts`
- `pnpm eslint src/modules/cycle/**/*.ts src/shared/database/schema/tasks.schema.ts src/shared/database/schema/cycle.schema.ts src/shared/database/schema/index.ts`
- Resultado:
  - migration `0005_chilly_sir_ram.sql` gerada com sucesso
  - 10 testes aprovados, 0 falhas no escopo `cycle`
  - lint sem erros no escopo alterado

## Observações
- O escopo entregue viabiliza T012 e T013 ao transformar Today em fonte persistida do backend, mas a integração efetiva do frontend com esse contrato ainda pertence a T012.
- Mantive intactas mudanças paralelas já existentes no repositório, especialmente no módulo `events` e em outra trilha de planning.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
