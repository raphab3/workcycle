# [T001] Entregar Integracoes Google multi-conta e toggle por calendario

> **Tipo:** FEAT | **Tamanho:** L (5pts) | **Fluxo:** CF-01  
> **Depende de:** - | **Bloqueia:** T002, T004, T008  
> **Assignee:** - | **Status:** Backlog

## Contexto
O produto ja possui vinculacao Google basica, mas ainda nao entrega a experiencia necessaria para o Modo Agenda: multiplas contas, calendarios por conta, estado operacional por integracao e controle de inclusao por calendario. Sem esse slice, a agenda continua sem uma origem governavel para leitura e contabilizacao.

## O que fazer
Entregar o slice completo de Integracoes Google, combinando backend e frontend para listar contas, listar calendarios por conta e alternar `isIncluded` por calendario na tela de Configuracoes.

### Arquivos esperados / impactados
- `backend/src/modules/accounts/controllers/accounts.controller.ts` - modificar
- `backend/src/modules/accounts/services/accounts-finder.service.ts` - modificar
- `backend/src/modules/accounts/repositories/accounts.repository.ts` - modificar
- `backend/src/modules/accounts/use-cases/` - criar ou modificar use cases de leitura e update de calendarios
- `backend/src/modules/accounts/accounts.module.ts` - modificar
- `frontend/src/modules/auth/components/AuthSettingsWorkspace/index.tsx` - modificar
- `frontend/src/modules/auth/components/AuthSettingsWorkspace/styles.ts` - modificar
- `frontend/src/modules/auth/services/authService.ts` - modificar
- `frontend/src/modules/auth/queries/` - criar ou modificar queries e mutations de integracoes
- `frontend/src/modules/auth/types/auth.ts` - modificar

## Criterios de Aceite

- [ ] Configuracoes exibe todas as contas Google conectadas com seus calendarios
- [ ] O usuario consegue alternar `isIncluded` por calendario e ver o estado refletido sem reload manual
- [ ] Cada calendario deixa clara a conta a que pertence
- [ ] Falha ou expiracao de uma conta aparece de forma localizada, sem bloquear as demais
- [ ] O backend expoe contratos suficientes para `/agenda`, widgets e accounting consumirem calendarios incluidos
- [ ] Testes cobrem renderizacao multi-conta, toggle por calendario e erro localizado
- [ ] Sem regressao no fluxo atual de conectar Google

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface GoogleAccountConnectionDTO {
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
    syncedAt: string | null;
  }>;
}
```

### Regras de Negocio
- O backend continua sendo dono do relacionamento conta -> calendarios.
- Alterar `isIncluded` nao apaga historico nem snapshot local existente.

### Edge Cases
- [ ] Duas contas com calendario `Primary`
- [ ] Conta sem calendarios retornados
- [ ] Toggle falha e exige rollback visual

## Notas de Implementacao
Este ticket fecha o slice de Integracoes. Nao inclui ainda sync de eventos nem widgets de agenda.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
