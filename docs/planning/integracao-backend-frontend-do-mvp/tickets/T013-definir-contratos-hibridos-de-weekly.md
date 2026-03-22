# [T013] Definir contratos híbridos de Weekly

> **Tipo:** API | **Tamanho:** M (3pts) | **Fluxo:** CF-05  
> **Depende de:** T007, T009, T011 | **Bloqueia:** T014  
> **Assignee:** — | **Status:** Backlog

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

- [ ] Existe contrato para visão semanal atual e histórico
- [ ] Está explícita a diferença entre semana aberta e semana fechada
- [ ] A origem dos números considera Tasks, Today e timezone do usuário
- [ ] O backend não produz métricas logicamente conflitantes com Today
- [ ] Testes do cálculo ou da consolidação foram adicionados
- [ ] Sem regressão nos testes existentes

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
- [ ] Semana atual com sessão aberta
- [ ] Projeto sem atividade real mas com planejamento semanal
- [ ] Mudança de timezone afetando agregação semanal

## Notas de Implementação
Se a forma final de persistência do histórico ainda variar, fixar primeiro o contrato externo e depois a implementação interna.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
