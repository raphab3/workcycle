# [T008] Persistir Settings e contratos de preferências

> **Tipo:** API | **Tamanho:** M (3pts) | **Fluxo:** CF-06  
> **Depende de:** T001 | **Bloqueia:** T009, T010  
> **Assignee:** — | **Status:** Backlog

## Contexto
Settings é dependência transversal para Today e Weekly por causa de timezone e boundary operacional. O backend precisa persistir preferências do usuário e expor contratos claros para leitura e atualização.

## O que fazer
Implementar persistência e contratos de Settings no backend, cobrindo timezone, notifications enabled, daily review time, cycle start hour e vínculo Google.

### Arquivos esperados / impactados
- `backend/src/shared/database/schema/` — criar ou modificar schema de preferências
- `backend/src/shared/database/migrations/*` — criar se necessário
- `backend/src/modules/auth/` ou novo módulo de settings — modificar
- `backend/src/modules/accounts/` — modificar se o vínculo Google permanecer aqui

## Critérios de Aceite

- [ ] Existe contrato de leitura de preferências do usuário autenticado
- [ ] Existe contrato de atualização parcial de preferências
- [ ] Timezone, notifications enabled, daily review time e cycle start hour ficam persistidos
- [ ] O vínculo Google pode ser consultado com segurança no contexto de settings
- [ ] Testes de leitura e atualização foram adicionados
- [ ] Sem regressão nos testes existentes

## Detalhes Técnicos

### Contrato / Interface
```typescript
interface UserSettingsDTO {
  timezone: string;
  notificationsEnabled: boolean;
  dailyReviewTime: string;
  cycleStartHour: string;
}
```

### Regras de Negócio
- Settings deve ser resolvido por usuário autenticado.
- Timezone não pode ser tratado como mera preferência visual; ele impacta lógica operacional.

### Edge Cases
- [ ] Timezone inválido
- [ ] Atualização parcial omitindo todos os campos
- [ ] Conta sem vínculo Google consultando settings

## Notas de Implementação
Se a decisão sobre desvinculação de Google continuar em aberto, limitar este ticket à leitura segura e ao contrato base.

---
*Gerado por PLANNER — Fase 3/3 | Epic: Integração Backend + Frontend do MVP*
