# [T011] Validar regressao ponta a ponta de notificacoes operacionais

> **Tipo:** TEST | **Tamanho:** L (5pts) | **Fluxo:** Cross-cutting
> **Depende de:** T006, T008, T009, T010 | **Bloqueia:** -
> **Assignee:** - | **Status:** Backlog

## Contexto
O epic cruza Today, Settings e um novo modulo de Notifications. Sem cobertura transversal, o risco maior e reintroduzir duplicacao, perda de recovery ou inconsistencias entre permissao local e preferencia persistida.

## O que fazer
Fechar a cobertura de testes unitarios e de integracao dos fluxos criticos de notificacoes operacionais, incluindo pulso, revisao diaria, recovery, multiaba e Settings.

### Arquivos esperados / impactados
- `frontend/src/modules/notifications/**/*.test.ts` - criar/expandir
- `frontend/src/modules/settings/**/*.test.tsx` - criar/expandir
- `frontend/src/modules/today/**/*.test.ts` - atualizar conforme integracao
- `backend/src/modules/settings/**/*.spec.ts` - revisar se houver gaps finais

## Criterios de Aceite

- [ ] Existe cobertura para canal in-app, canal browser e modo degradado.
- [ ] Existe cobertura para expiracao de pulso, `paused_inactivity` e supressao de repeticao.
- [ ] Existe cobertura para revisao diaria com timezone e requisito de sessao ativa.
- [ ] Existe cobertura para recovery na retomada e historico curto multiaba/reload.
- [ ] Existe cobertura para a UI de Settings em estados saudavel, degradado e erro.
- [ ] A suite relevante roda sem regressao nas areas alteradas.

## Detalhes Tecnicos

### Contrato / Interface
```typescript
type CriticalNotificationScenario =
  | 'pulse-due-visible-tab'
  | 'pulse-expired-background'
  | 'daily-review-active-day'
  | 'recovery-after-resume'
  | 'settings-degraded-state'
  | 'multi-tab-dedupe';
```

### Regras de Negocio
- Priorizar cenarios de regressao ligados a confianca do usuario.
- Cobertura deve provar a separacao entre preferencia do produto e permissao do navegador.
- Testes devem refletir o comportamento best effort aprovado para o MVP.

### Edge Cases
- [ ] Permissao revogada no meio do dia.
- [ ] Usuario retorna apos cruzar o boundary operacional.
- [ ] Evento stale armazenado localmente ainda existe ao abrir Settings.

## Notas de Implementacao
Se algum ticket anterior introduzir utilitarios de teste ou fixtures compartilhadas, consolidar aqui em vez de duplicar cenarios em cada modulo.

Este ticket permanece como L apenas se os tickets anteriores entregarem sua propria cobertura local. Ele nao deve virar backlog acumulado de testes que deveriam ter sido feitos em T002-T010.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Notificacoes Operacionais do WorkCycle*