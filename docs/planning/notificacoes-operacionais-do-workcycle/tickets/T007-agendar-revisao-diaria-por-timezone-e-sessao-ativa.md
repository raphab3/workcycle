# [T007] Agendar revisao diaria por timezone e sessao ativa

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-04
> **Depende de:** T002, T004 | **Bloqueia:** T008, T010
> **Assignee:** - | **Status:** Backlog

## Contexto
A revisao diaria precisa deixar de ser apenas um conceito de produto e passar a existir como agendamento client-side coerente com `dailyReviewTime`, `timezone` e a decisao aprovada de so existir em dias com sessao ativa.

## O que fazer
Implementar o scheduler client-side da revisao diaria, usando Settings persistidos e o estado operacional do dia para decidir quando criar um lembrete de revisao.

### Arquivos esperados / impactados
- `frontend/src/modules/notifications/services/dailyReviewScheduler.ts` - criar
- `frontend/src/modules/notifications/hooks/useDailyReviewScheduler.ts` - criar
- `frontend/src/modules/today/**/*.ts` - adaptar seletor ou helper para identificar dia com sessao ativa
- `frontend/src/modules/notifications/**/*.test.ts` - criar/atualizar

## Criterios de Aceite

- [ ] Dias sem sessao ativa nao geram agendamento de revisao diaria.
- [ ] Dias com sessao ativa calculam o lembrete usando `dailyReviewTime` no `timezone` persistido.
- [ ] Mudanca de `timezone` ou `dailyReviewTime` reagenda apenas lembretes futuros.
- [ ] O scheduler nao cria lembretes duplicados para o mesmo dia operacional.
- [ ] Testes cobrem boundary operacional, timezone e alteracao de configuracao.

## Detalhes Tecnicos

### Contrato / Interface
```typescript
export interface DailyReviewScheduleState {
  cycleDate: string;
  scheduledFor: string | null;
  shouldSchedule: boolean;
}
```

### Regras de Negocio
- A referencia do dia deve respeitar o boundary operacional vigente.
- O scheduler so prepara o lembrete; a entrega continua com o motor de Notifications.
- Sessao ativa no dia e pre-condicao obrigatoria.

### Edge Cases
- [ ] Usuario muda timezone no meio do dia.
- [ ] Usuario muda horario de revisao depois de ja ter iniciado sessao.
- [ ] O horario calculado cai depois do boundary do ciclo.

## Notas de Implementacao
Evitar logica de horario diretamente em componentes de tela. Concentrar a regra em service/hook testavel.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Notificacoes Operacionais do WorkCycle*