# [T009] Implementar API e regras de accounting para eventos operacionais

> **Tipo:** API | **Tamanho:** L (5pts) | **Fluxo:** CF-05  
> **Depende de:** T004 | **Bloqueia:** T010, T011  
> **Assignee:** - | **Status:** Backlog

## Contexto
O schema ja possui `event_accounting_statuses`, mas o modulo `accounting` ainda nao e a fronteira operacional que decide se um evento entra, nao entra ou deixa de perguntar no ciclo. Esse dominio precisa ser consolidado antes de qualquer desconto de horas.

## O que fazer
Implementar no backend os contratos e regras de negocio para leitura e decisao operacional de eventos por data, com suporte a `pending`, `approved`, `ignored` e `silenced`, incluindo projeto opcional e minutos aprovados.

### Arquivos esperados / impactados
- `backend/src/modules/accounting/controllers/accounting.controller.ts` - modificar
- `backend/src/modules/accounting/services/accounting-finder.service.ts` - modificar
- `backend/src/modules/accounting/services/` - criar service de escrita e resolucao operacional
- `backend/src/modules/accounting/repositories/accounting.repository.ts` - modificar
- `backend/src/modules/accounting/use-cases/list-accounting-statuses.use-case.ts` - modificar
- `backend/src/modules/accounting/use-cases/` - criar use cases de approve, ignore e silence
- `backend/src/modules/accounting/accounting.module.ts` - modificar

## Criterios de Aceite

- [ ] Existem endpoints para listar pendencias e registrar decisoes operacionais por evento e data
- [ ] `approved`, `ignored` e `silenced` sao idempotentes por `event_id + date`
- [ ] Aprovacao aceita `approvedMinutes` e `projectId` opcional
- [ ] Projeto vinculado e validado contra o usuario autenticado
- [ ] O contrato permite distinguir evento pendente, resolvido e revisao pendente apos reconciliacao
- [ ] Testes de service cobrem approve, ignore, silence e tentativa de vincular projeto invalido
- [ ] Sem regressao na leitura atual de accounting

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface ResolveEventAccountingDTO {
  eventId: string;
  date: string;
  status: 'approved' | 'ignored' | 'silenced';
  approvedMinutes?: number;
  projectId?: string | null;
}
```

### Regras de Negocio
- Apenas eventos existentes no snapshot local podem receber decisao operacional.
- Silenciar deve preservar historico ja resolvido e reduzir ruido futuro da recorrencia sempre que houver chave consistente.

### Edge Cases
- [ ] Evento aprovado sem projeto vinculado
- [ ] Evento alterado apos aprovacao precisa de revisao
- [ ] Serie recorrente sem `recurringEventId` consistente

## Notas de Implementacao
Se a regra final para recorrencia sem chave consistente permanecer aberta, documentar o fallback implementado no proprio ticket antes de fechar.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
