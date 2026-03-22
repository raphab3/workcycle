# [T010] Fechar contrato canônico de Today

> **Tipo:** RFCT | **Tamanho:** M (3pts) | **Fluxo:** CF-04  
> **Depende de:** T005, T008 | **Bloqueia:** T011  
> **Assignee:** — | **Status:** Backlog

## Contexto
Today é o domínio mais sensível do MVP, porque concentra estado temporal, pulse tracking, boundary do dia, sessão, regularizações e rollover. Antes da implementação completa, o contrato canônico precisa estar explícito para evitar soluções parciais incompatíveis entre backend e frontend.

## O que fazer
Formalizar o contrato canônico do domínio Today, incluindo o payload da sessão diária, regularizações, fechamento do dia, rollover e a decisão operacional mínima sobre trilha auditável.

### Arquivos esperados / impactados
- `backend/src/modules/cycle/` — modificar ou complementar contratos existentes
- `backend/src/modules/cycle/controllers/cycle.controller.ts` — modificar
- `backend/src/modules/cycle/use-cases/*` — criar ou modificar
- `frontend/src/modules/today/types/` — revisar posteriormente a compatibilidade

## Critérios de Aceite

- [ ] Existe payload alvo explícito para sessão diária do MVP
- [ ] Projeto ativo, blocos de tempo, pulses, regularizações, fechamento e rollover estão representados no contrato
- [ ] A relação com task e ciclo diário concreto está explícita
- [ ] A necessidade ou não de trilha auditável mínima para regularizações foi decidida e documentada no contrato
- [ ] O contrato aprovado pode ser implementado sem nova lacuna estrutural

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface TodaySessionDTO {
  id: string;
  state: 'idle' | 'running' | 'paused_manual' | 'paused_inactivity' | 'completed';
  activeProjectId: string | null;
  cycleDate: string;
}
```

### Regras de Negócio
- Today é source of truth do backend no MVP.
- Qualquer projeção visual no frontend deve derivar do contrato persistido.

### Edge Cases
- [ ] Sessão em andamento ao virar o dia
- [ ] Regularização aplicada depois do fechamento
- [ ] Task removida do ciclo com sessão ainda aberta

## Notas de Implementação
Este ticket é deliberadamente preparatório. Sem ele, a implementação de Today tende a espalhar decisões estruturais em endpoints e componentes.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
