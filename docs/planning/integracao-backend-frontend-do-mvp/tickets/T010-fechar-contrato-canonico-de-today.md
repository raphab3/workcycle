# [T010] Fechar contrato canônico de Today

> **Tipo:** RFCT | **Tamanho:** M (3pts) | **Fluxo:** CF-04  
> **Depende de:** T005, T008 | **Bloqueia:** T011  
> **Assignee:** Copilot | **Status:** Concluído

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

- [x] Existe payload alvo explícito para sessão diária do MVP
- [x] Projeto ativo, blocos de tempo, pulses, regularizações, fechamento e rollover estão representados no contrato
- [x] A relação com task e ciclo diário concreto está explícita
- [x] A necessidade ou não de trilha auditável mínima para regularizações foi decidida e documentada no contrato
- [x] O contrato aprovado pode ser implementado sem nova lacuna estrutural

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

## Entrega
- Criado o contrato canônico de Today no backend em `backend/src/modules/cycle/types/today.ts`, consolidando payload alvo para sessão diária, boundary operacional, blocos de tempo, pulses, regularizações, fechamento do dia, rollover, snapshot e vínculo com tasks.
- Criado `backend/src/modules/cycle/cycle.schemas.ts` com schemas Zod do payload canônico para evitar deriva estrutural antes da implementação persistida.
- `GET /cycle/status` passou a expor o contrato canônico definido por `GetCycleStatusUseCase`, servindo como endpoint de descoberta até T011 implementar os endpoints operacionais do domínio.
- A decisão de auditoria mínima do MVP foi fechada como `inline-pulse-history`: regularizações ficam rastreadas na própria trilha de pulses da sessão diária, sem tabela separada neste estágio.

## Decisões Estruturais
- `Today` será source of truth do backend para sessão diária, pulse tracking, regularização, fechamento e rollover.
- A relação com tasks ficou explícita por `cycleSessionId + cycleAssignment`, em vez de depender apenas do board visual do frontend.
- `timezone` e `cycleStartHour` entram no contrato operacional do ciclo para alinhar boundary e rollover com Settings.
- Snapshot do ciclo permanece parte do contrato, mas pode ser `null` enquanto a sessão ainda não tiver fechamento materializado.

## Validação
- `pnpm exec tsx --test src/modules/cycle/cycle.schemas.spec.ts src/modules/cycle/types/today.spec.ts src/modules/cycle/use-cases/get-cycle-status.use-case.spec.ts`
- Resultado: 4 testes aprovados, 0 falhas.
- `pnpm eslint src/modules/cycle/**/*.ts`
- Resultado: sem erros no escopo do módulo `cycle`.

## Observações
- O endpoint atual entrega contrato e decisão estrutural, não estado persistido real. A implementação operacional de sessão, pulse e rollover segue em T011.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
