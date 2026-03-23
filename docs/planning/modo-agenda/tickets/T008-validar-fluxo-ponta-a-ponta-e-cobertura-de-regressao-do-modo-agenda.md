# [T008] Validar fluxo ponta a ponta e cobertura de regressao do Modo Agenda

> **Tipo:** TEST | **Tamanho:** L (5pts) | **Fluxo:** CF-01, CF-02, CF-03, CF-04, CF-05, CF-06  
> **Depende de:** T001, T004, T005, T006, T007 | **Bloqueia:** -  
> **Assignee:** - | **Status:** Backlog

## Objetivo
Fechar o epic com validacao manual estruturada e cobertura automatizada suficiente para provar que a cadeia `accounts -> events -> accounting -> cycle` funciona no caminho principal e nos estados degradados mais relevantes.

## Escopo desta entrega
- Consolidar um checklist manual objetivo para o fluxo ponta a ponta do Modo Agenda.
- Atualizar ou adicionar testes automatizados nas areas alteradas do backend e frontend.
- Validar regressao nas rotas e fluxos ja existentes tocados pelo epic.

## Estrutura esperada da validacao manual

### 1. Integracoes
- [ ] Conectar nova conta Google continua funcionando.
- [ ] Listar multiplas contas com calendarios distintos funciona.
- [ ] Toggle de `isIncluded` persiste e reflete sem reload manual.
- [ ] Conta expirada fica degradada sem bloquear outra conta funcional.

### 2. Leitura e refresh operacional
- [ ] `/agenda` carrega eventos da janela esperada.
- [ ] Refresh manual atualiza a janela corrente.
- [ ] Falha parcial de sync aparece de forma localizada.

### 3. CRUD de eventos
- [ ] Create em calendario permitido aparece na `/agenda` e no Google Calendar.
- [ ] Update reflete no produto e no Google Calendar.
- [ ] Delete remove o evento do produto e do Google Calendar.
- [ ] Erro remoto nao deixa sucesso silencioso na UI.

### 4. Widgets de Hoje e Semana
- [ ] `/hoje` mostra os proximos eventos do dia.
- [ ] `/semana` mostra o mesmo resumo operacional.
- [ ] Estado vazio e estado degradado continuam utilizaveis.

### 5. Accounting operacional
- [ ] Aprovar evento com e sem `projectId` opcional funciona.
- [ ] Ignorar evento remove a pendencia operacional da data.
- [ ] Silenciar recorrencia suportada evita novo ruido futuro.
- [ ] Repetir a mesma decisao nao gera duplicidade.

### 6. Impacto no ciclo
- [ ] Apenas eventos `approved` descontam horas do ciclo.
- [ ] O total aprovado aparece em `/hoje`.
- [ ] Quando houver projeto vinculado, o impacto por projeto fica acessivel.
- [ ] Evento aprovado alterado ou removido externamente sinaliza revisao pendente.

## Cobertura automatizada esperada

### Backend
- `accounts`: listagem multi-conta e update de `isIncluded`.
- `events`: listagem por intervalo, sync, reconciliacao, create, update e delete write-through.
- `accounting`: idempotencia por `eventId + date`, validacao de projeto, silence e sinalizacao de revisao.
- `cycle`: agregacao do impacto aprovado, ausencia de duplicidade e `hasReviewPending`.

### Frontend
- `auth`: renderizacao das integracoes e toggle por calendario.
- `agenda`: rota, estados de query, refresh, create, update e delete.
- `today` e `weekly`: widget com loading, vazio, erro localizado e sucesso.
- `today`: exibicao do impacto no ciclo e revisao pendente.

## Arquivos esperados / impactados
- `frontend/src/modules/auth/**/*.test.ts*`
- `frontend/src/modules/agenda/**/*.test.ts*`
- `frontend/src/modules/today/**/*.test.ts*`
- `frontend/src/modules/weekly/**/*.test.ts*`
- `frontend/src/app/(pages)/agenda/page.test.tsx`
- `frontend/src/app/(pages)/hoje/page.test.tsx`
- `frontend/src/app/(pages)/semana/page.test.tsx`
- `backend/src/modules/accounts/**/*.spec.ts`
- `backend/src/modules/events/**/*.spec.ts`
- `backend/src/modules/accounting/**/*.spec.ts`
- `backend/src/modules/cycle/**/*.spec.ts`

## Criterios de aceite
- [ ] Existe checklist manual executavel cobrindo Integracoes, leitura/sync, CRUD, widgets, accounting e impacto no ciclo.
- [ ] O fluxo principal da `/agenda` reflete corretamente no Google Calendar para create, update e delete.
- [ ] Multiplas contas operam de forma independente tanto no caminho feliz quanto em falha parcial.
- [ ] Eventos silenciados deixam de gerar ruido operacional dentro da regra suportada do MVP.
- [ ] Reunioes aprovadas descontam horas do ciclo sem duplicidade observavel.
- [ ] Testes criticos foram adicionados ou atualizados nas areas alteradas do backend e frontend.
- [ ] Nao ha regressao visivel em navegacao principal, auth Google, `/configuracoes`, `/hoje`, `/semana` e `/agenda`.

## Edge cases obrigatorios
- [ ] Refresh apos mutation critica na `/agenda`.
- [ ] Conta expirada coexistindo com outra funcional.
- [ ] Evento aprovado alterado externamente antes do reload do ciclo.
- [ ] Evento de calendario excluido nao aparece em widget nem impacta ciclo.

## Nao faz parte
- Criar nova infraestrutura de teste E2E fora do necessario para validar o epic.
- Reabrir decisoes de escopo do epic ja aprovadas.
- Tratar integracoes nao aprovadas, como Outlook ou Apple Calendar.

## Notas de implementacao
- Executar este ticket apenas ao final da cadeia principal.
- Cobertura isolada de unit tests nao substitui validacao funcional ponta a ponta; ambos sao obrigatorios aqui.
- Se algum ponto continuar ambiguo por decisao aberta do epic, registrar explicitamente o comportamento validado e a pendencia remanescente em vez de mascarar a lacuna.

---
*Gerado por PLANNER - Fase 3/3 | Epic: Modo Agenda*