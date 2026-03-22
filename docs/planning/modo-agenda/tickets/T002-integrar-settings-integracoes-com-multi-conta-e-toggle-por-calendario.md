# [T002] Integrar Settings/Integracoes com multi-conta e toggle por calendario

> **Tipo:** FEAT | **Tamanho:** M (3pts) | **Fluxo:** CF-01  
> **Depende de:** T001 | **Bloqueia:** T006, T013  
> **Assignee:** - | **Status:** Backlog

## Contexto
O frontend ja possui `AuthSettingsWorkspace` e o fluxo de vinculacao Google, mas ainda nao entrega a experiencia operacional de Integracoes para gerenciar multiplas contas e calendarios. Sem isso, a agenda nao tem uma origem controlavel para leitura e contabilizacao.

## O que fazer
Evoluir a rota `/configuracoes` para uma experiencia explicita de Integracoes, exibindo contas Google conectadas, seus calendarios e o toggle de inclusao operacional por calendario.

### Arquivos esperados / impactados
- `frontend/src/modules/auth/components/AuthSettingsWorkspace/index.tsx` - modificar
- `frontend/src/modules/auth/components/AuthSettingsWorkspace/styles.ts` - modificar
- `frontend/src/modules/auth/services/authService.ts` - modificar
- `frontend/src/modules/auth/queries/useGoogleAccountsQuery.ts` - modificar
- `frontend/src/modules/auth/queries/` - criar query para calendarios ou adaptar a query existente
- `frontend/src/modules/auth/types/auth.ts` - modificar
- `frontend/src/app/(pages)/configuracoes/page.tsx` - validar composicao

## Criterios de Aceite

- [ ] A tela de Configuracoes exibe todas as contas Google conectadas com seus calendarios
- [ ] O usuario consegue alternar `isIncluded` por calendario sem recarregar manualmente a pagina
- [ ] Estados de loading, empty, error e success existem para a secao de Integracoes
- [ ] Falha de uma conta aparece de forma localizada, sem colapsar o restante da tela
- [ ] Acoes de toggle invalidam ou atualizam cache de forma consistente
- [ ] Testes de componente ou query cobrem renderizacao multi-conta e alternancia de calendario
- [ ] Sem regressao no fluxo atual de conectar Google

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface GoogleAccountConnectionViewModel {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  calendars: Array<{
    id: string;
    name: string;
    colorHex: string;
    isIncluded: boolean;
    isPrimary: boolean;
  }>;
}
```

### Regras de Negocio
- O frontend nao deve manter fonte paralela de inclusao por calendario fora do backend.
- O componente precisa deixar claro a qual conta cada calendario pertence.

### Edge Cases
- [ ] Conta sem calendarios retornados
- [ ] Mutacao de toggle falha e precisa rollback visual
- [ ] Conta conectada logo apos retorno do OAuth

## Notas de Implementacao
Manter este ticket restrito a Integracoes. Nao iniciar ainda a rota `/agenda` nem widgets de Hoje/Semana.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
