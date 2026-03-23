# [T013] Definir contratos híbridos de Weekly

> **Tipo:** API | **Tamanho:** M (3pts) | **Fluxo:** CF-05  
> **Depende de:** T007, T009, T011 | **Bloqueia:** T014  
> **Assignee:** Copilot | **Status:** Concluído

## Contexto
Weekly depende de dados confiáveis de Tasks, Today e Settings. Antes da integração da tela, o backend precisa explicitar o modelo híbrido: semana aberta calculada sob demanda e semanas fechadas com histórico persistido.

## O que fazer
Definir e implementar os contratos backend de Weekly para snapshot/histórico e consolidar a regra de separação entre dado provisório e dado fechado.

### Arquivos esperados / impactados
- `backend/src/modules/weekly/` — criar se necessário
- `backend/src/modules/weekly/controllers/` — criar
- `backend/src/modules/weekly/services/` — criar
- `backend/src/modules/weekly/use-cases/` — criar
- `backend/src/shared/database/schema/` — criar estruturas persistidas se a solução exigir snapshot materializado

## Critérios de Aceite

- [x] Existe contrato para visão semanal atual e histórico
- [x] Está explícita a diferença entre semana aberta e semana fechada
- [x] A origem dos números considera Tasks, Today e timezone do usuário
- [x] O backend não produz métricas logicamente conflitantes com Today
- [x] Testes do cálculo ou da consolidação foram adicionados
- [x] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface WeeklySnapshotResponseDTO {
  weekKey: string;
  isFinal: boolean;
  rows: Array<{
    projectId: string;
    plannedWeekHours: number;
    actualWeekHours: number;
    deltaHours: number;
  }>;
}
```

### Regras de Negócio
- Semana aberta pode ser calculada sob demanda.
- Semana fechada precisa de histórico estável e auditável o suficiente para consulta futura.

### Edge Cases
- [x] Semana atual com sessão aberta
- [x] Projeto sem atividade real mas com planejamento semanal
- [x] Mudança de timezone afetando agregação semanal

## Notas de Implementação
- Foi criado um novo módulo backend `weekly` com `GET /weekly/snapshots` e `GET /weekly/history`.
- A semana aberta é derivada sob demanda a partir de `cycle_sessions`, `cycle_time_blocks`, `tasks`, `projects` e `settings`, preservando horas provisórias quando o dia corrente ainda está aberto.
- Semanas fechadas são materializadas em `weekly_snapshots` com payload completo persistido, garantindo histórico estável para consumo futuro do frontend.
- O contrato semanal passou a expor `weekKey`, `weekStartsAt`, `weekEndsAt`, `timezone`, `source`, `isFinal`, `rows` e `summary`.
- Cada `row` inclui `cells` por dia da semana, `plannedWeekHours`, `actualWeekHours`, `deltaHours` e `status`, permitindo que T014 adapte a grade semanal sem recomputar regra de domínio no frontend.
- O cálculo de `plannedWeekHours` reaproveita a combinação entre configuração de projeto (`fixedDays`, `fixedHoursPerDay`, `allocationPct`) e carga aberta de Tasks para evitar métricas desconectadas do estado operacional real.

## Validação
- `pnpm test src/modules/weekly/**/*.spec.ts` no backend: specs novos de Weekly e a suíte existente passaram sem regressão.
- `pnpm eslint src/modules/weekly/**/*.ts src/shared/database/schema/weekly.schema.ts src/shared/database/schema/index.ts src/app.module.ts`: sem erros.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
