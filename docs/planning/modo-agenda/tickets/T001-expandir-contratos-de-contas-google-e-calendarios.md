# [T001] Expandir contratos de contas Google e calendarios

> **Tipo:** API | **Tamanho:** M (3pts) | **Fluxo:** CF-01  
> **Depende de:** - | **Bloqueia:** T002, T003  
> **Assignee:** - | **Status:** Backlog

## Contexto
O reuso de OAuth ja existe no produto, mas a base atual ainda esta orientada a listar contas Google vinculadas de forma simples. O Modo Agenda precisa elevar esse contrato para suportar multiplas contas, calendarios por conta, status operacional e toggle de inclusao sem acoplar o frontend a inferencias locais.

## O que fazer
Expandir o dominio `accounts` para expor contratos canonicos de contas Google e calendarios conectados, com dados suficientes para Settings/Integracoes, `/agenda`, widgets e contabilizacao operacional.

### Arquivos esperados / impactados
- `backend/src/modules/accounts/controllers/accounts.controller.ts` - modificar
- `backend/src/modules/accounts/services/accounts-finder.service.ts` - modificar
- `backend/src/modules/accounts/repositories/accounts.repository.ts` - modificar
- `backend/src/modules/accounts/use-cases/list-google-accounts.use-case.ts` - modificar
- `backend/src/modules/accounts/use-cases/` - criar use case para leitura e atualizacao de calendarios, se necessario
- `backend/src/modules/accounts/accounts.module.ts` - modificar
- `backend/src/shared/database/schema/accounts.schema.ts` - modificar apenas se faltar metadata essencial

## Criterios de Aceite

- [ ] Existe contrato de leitura que devolve contas Google com seus calendarios conectados
- [ ] Cada calendario informa pelo menos `id`, `name`, `colorHex`, `isIncluded`, `isPrimary` e metadata util para UX operacional
- [ ] Existe endpoint ou contrato de atualizacao para alternar `google_calendars.is_included`
- [ ] Respostas deixam claro o escopo por conta, evitando ambiguidade quando nomes de calendarios se repetem
- [ ] Falha ou expiracao de uma conta pode ser representada sem ocultar as demais
- [ ] Testes de repository ou service cobrem leitura multi-conta e toggle por calendario
- [ ] Sem regressao nos endpoints atuais de contas Google

## Detalhes Tecnicos

### Contrato / Interface
```typescript
interface GoogleCalendarConnectionDTO {
  id: string;
  accountId: string;
  name: string;
  colorHex: string;
  isIncluded: boolean;
  isPrimary: boolean;
  syncedAt: string | null;
}

interface GoogleAccountConnectionDTO {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  calendars: GoogleCalendarConnectionDTO[];
}
```

### Regras de Negocio
- O backend continua sendo dono do relacionamento conta -> calendarios.
- Toggle de calendario nao deve apagar snapshot de eventos nem historico de accounting.

### Edge Cases
- [ ] Duas contas com calendario chamado `Primary`
- [ ] Conta desativada com calendarios ainda persistidos
- [ ] Calendario primary marcado como excluido pelo usuario

## Notas de Implementacao
Evitar embutir regra de sync de eventos neste ticket. O objetivo aqui e estabilizar apenas os contratos de contas e calendarios para os demais fluxos.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*
