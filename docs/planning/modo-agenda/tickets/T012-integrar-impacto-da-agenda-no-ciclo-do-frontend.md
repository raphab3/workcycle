# [T012] Integrar impacto da agenda no ciclo do frontend

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-06  
> **Depende de:** T010, T011 | **Bloqueia:** T013  
> **Assignee:** - | **Status:** Backlog

## Contexto
Depois que o backend expuser o impacto aprovado da agenda, a tela `/hoje` precisa refletir esse desconto de forma clara, sem transformar a experiencia do ciclo em uma agenda disfarçada.

## O que fazer
Integrar o resumo de impacto da agenda ao frontend de Today, exibindo horas abatidas, agregacao por projeto quando houver e indicacao de revisoes pendentes.

### Arquivos esperados / impactados
- `frontend/src/modules/today/components/TodayPlannerOverview/index.tsx` - modificar
- `frontend/src/modules/today/components/TodayCycleForm/index.tsx` - modificar, se necessario
- `frontend/src/modules/today/types/` - criar ou modificar tipos de impacto
- `frontend/src/modules/today/` - criar query ou adaptar service do ciclo, se necessario
- `frontend/src/modules/agenda/queries/` - reutilizar invalidacoes quando accounting mudar

## Criterios de Aceite

- [ ] A tela `/hoje` mostra o impacto total das reunioes aprovadas na disponibilidade do dia
- [ ] Quando houver projetos vinculados, o resumo por projeto fica acessivel ao usuario
- [ ] Revisoes pendentes por eventos alterados ou removidos ficam visiveis sem quebrar o fluxo do ciclo
- [ ] Mudancas de accounting refletem no ciclo apos invalidacao ou refetch consistente
- [ ] Testes cobrem exibicao de impacto total, sem impacto e estado de revisao

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface TodayAgendaImpactViewModel {
  approvedMinutesTotal: number;
  hasReviewPending: boolean;
  projects: Array<{
    projectId: string;
    minutes: number;
  }>;
}
```

### Regras de Negocio
- O frontend deve exibir o impacto da agenda como ajuste operacional do ciclo, nao como substituicao da logica atual da tela.
- Reunioes ainda pendentes nao entram no resumo de disponibilidade.

### Edge Cases
- [ ] Usuario aprova reuniao e permanece na mesma sessao de Today
- [ ] Evento em revisao precisa coexistir com o restante do ciclo sem travar a tela
- [ ] Dia sem reunioes aprovadas

## Notas de Implementacao
Manter o componente de impacto suficientemente desacoplado para reaproveitamento futuro em outras telas, se necessario.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
