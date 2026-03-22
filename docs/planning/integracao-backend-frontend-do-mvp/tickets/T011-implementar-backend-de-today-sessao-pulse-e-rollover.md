# [T011] Implementar backend de Today: sessão, pulse e rollover

> **Tipo:** API | **Tamanho:** L (5pts) | **Fluxo:** CF-04  
> **Depende de:** T010 | **Bloqueia:** T012, T013  
> **Assignee:** — | **Status:** Backlog

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

- [ ] Existem endpoints para obter sessão, atualizar sessão, registrar pulse e consultar registros relevantes
- [ ] Sessão diária pode ser retomada após reload e troca de dispositivo
- [ ] `pulse` possui proteção mínima contra duplicidade indevida
- [ ] Timezone e boundary do dia respeitam settings persistidos
- [ ] Fechamento do dia e rollover persistem estado suficiente para o próximo fluxo
- [ ] Testes de contrato e regras principais foram adicionados
- [ ] Sem regressão nos testes existentes

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

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
