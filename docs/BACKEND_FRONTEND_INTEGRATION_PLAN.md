# WorkCycle Backend + Frontend Integration Plan

> Escopo de integração completa entre backend e frontend do MVP. Este documento organiza a entrega por domínio, com tasks rastreáveis, dependências explícitas e critérios mínimos de validação.

## Objetivo

Conectar os módulos já existentes do frontend com contratos reais do backend, remover dependências de estado mock/local onde isso bloqueia persistência e fechar o fluxo ponta a ponta para `Projetos`, `Tasks`, `Semana`, `Today` e `Settings`.

## Prioridade Recomendada

1. `Projects`
2. `Tasks`
3. `Today`
4. `Weekly`
5. `Settings`

## Regras Gerais

- Toda integração deve sair com contrato HTTP explícito entre backend e frontend.
- Toda nova leitura de servidor no frontend deve seguir o fluxo `query hook -> service -> axios -> API`.
- Toda mutation deve invalidar ou atualizar cache React Query de forma previsível.
- O backend deve manter a organização modular por feature: `controllers/`, `services/`, `repositories/`, `use-cases/`.
- O frontend deve manter a organização modular por domínio: `services/`, `queries/`, `components/`, `types/`, `utils/`.
- Sempre que um domínio migrar de mock local para persistência real, os estados de loading, empty, error e success devem ser tratados na UI.
- Tasks de integração só podem ser consideradas concluídas com validação funcional ponta a ponta.

## Definição de Pronto

Um bloco de integração só pode ser fechado quando todos os itens abaixo forem atendidos:

1. Endpoint implementado ou ajustado no backend com validação e retorno tipado.
2. Service e query hooks implementados no frontend para o domínio.
3. Tela integrada sem depender de mock local para o fluxo principal.
4. Estados de loading, erro e vazio cobertos na UI.
5. Testes do escopo adicionados ou atualizados.
6. Fluxo manual validado de ponta a ponta.

## Fase 0 - Foundation de Integração

### Objetivo

Fechar os pré-requisitos comuns para os cinco domínios.

### Tasks

- [ ] INT-0001 revisar e consolidar o contrato de autenticação usado pelo frontend para chamadas autenticadas.
- [ ] INT-0002 confirmar padrão de tratamento de erro HTTP no frontend para `401`, `403`, `404` e `500`.
- [ ] INT-0003 revisar `frontend/src/lib/axios.ts` para garantir envio consistente de credenciais e interceptação de sessão expirada.
- [ ] INT-0004 revisar `frontend/src/lib/queryClient.ts` para política padrão de retry, stale time e invalidação.
- [ ] INT-0005 definir envelope de resposta e erro compartilhado para os novos endpoints quando necessário.
- [ ] INT-0006 alinhar nomenclatura de DTOs entre backend e frontend para reduzir mapeamentos desnecessários.

### Critérios mínimos de validação

- login continua funcionando após a revisão da camada HTTP.
- queries autenticadas conseguem recuperar sessão válida sem regressão.
- mutations exibem erros recuperáveis de forma consistente.

## Fase 1 - Projects

### Objetivo

Trocar o fluxo local do módulo de projetos por integração real com o CRUD já existente no backend.

### Backend

- [ ] INT-0101 revisar o contrato atual de `GET /projects` para garantir compatibilidade com os tipos usados no frontend.
- [ ] INT-0102 revisar o contrato de `POST /projects` para criação com retorno da entidade persistida.
- [ ] INT-0103 revisar o contrato de `PATCH /projects/:id` para atualização parcial com retorno consistente.
- [ ] INT-0104 revisar o contrato de `PATCH /projects/:id/status` para alternância de status com resposta padronizada.
- [ ] INT-0105 documentar payloads válidos, campos opcionais e mensagens de erro do domínio de projetos.

### Frontend

- [ ] INT-0111 criar `frontend/src/modules/projects/services/projectsService.ts`.
- [ ] INT-0112 criar `frontend/src/modules/projects/queries/projectKeys.ts`.
- [ ] INT-0113 criar `useProjectsQuery`.
- [ ] INT-0114 criar `useCreateProjectMutation`.
- [ ] INT-0115 criar `useUpdateProjectMutation`.
- [ ] INT-0116 criar `useToggleProjectStatusMutation`.
- [ ] INT-0117 adaptar `ProjectsWorkspace` para consumir React Query em vez do fluxo principal local.
- [ ] INT-0118 tratar estados de loading, erro, vazio e refetch na tela de projetos.

### Integração

- [ ] INT-0121 remover dependência do mock local para listagem principal de projetos.
- [ ] INT-0122 garantir invalidação de cache após create, update e toggle de status.
- [ ] INT-0123 validar consistência entre percentuais, tipo do projeto e status retornado pela API.

### Testes e Validação

- [ ] INT-0131 adicionar testes unitários do `projectsService`.
- [ ] INT-0132 adicionar testes dos query hooks de projetos.
- [ ] INT-0133 adicionar teste de integração da tela cobrindo criar, editar e pausar projeto.
- [ ] INT-0134 executar validação manual: criar projeto, editar projeto, alternar status e recarregar a página.

## Fase 2 - Tasks

### Objetivo

Implementar persistência real para tasks e integrar o board do frontend com backend.

### Backend

- [ ] INT-0201 criar schema Drizzle para `tasks` com `id`, `userId`, `projectId`, `title`, `description`, `priority`, `status`, `estimatedHours`, `dueDate`, `isArchived`, `createdAt` e `updatedAt`.
- [ ] INT-0202 registrar o schema de tasks no índice de schemas do backend.
- [ ] INT-0203 criar `TasksModule` seguindo o padrão modular do backend.
- [ ] INT-0204 criar `tasks.repository.ts` com operações de leitura e escrita filtradas por usuário.
- [ ] INT-0205 criar serviços de leitura e escrita para tasks.
- [ ] INT-0206 criar use-cases de listar, criar, atualizar, alterar status e arquivar task.
- [ ] INT-0207 criar controller com endpoints `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`, `PATCH /tasks/:id/status` e `PATCH /tasks/:id/archive`.
- [ ] INT-0208 adicionar validação de payloads com schema do domínio.
- [ ] INT-0209 registrar o módulo no `app.module.ts`.

### Frontend

- [ ] INT-0211 criar `frontend/src/modules/tasks/services/tasksService.ts`.
- [ ] INT-0212 criar `frontend/src/modules/tasks/queries/taskKeys.ts`.
- [ ] INT-0213 criar `useTasksQuery`.
- [ ] INT-0214 criar `useCreateTaskMutation`.
- [ ] INT-0215 criar `useUpdateTaskMutation`.
- [ ] INT-0216 criar `useUpdateTaskStatusMutation`.
- [ ] INT-0217 criar `useArchiveTaskMutation`.
- [ ] INT-0218 adaptar `TasksWorkspace` para consumir dados do servidor no fluxo principal.
- [ ] INT-0219 definir se a ordem das colunas permanece local ou passa a ser persistida por usuário.

### Integração

- [ ] INT-0221 mapear os tipos atuais do frontend para o contrato persistido sem perder campos relevantes como checklist, prioridade e alocação no ciclo.
- [ ] INT-0222 garantir relacionamento consistente entre `task` e `project` no frontend.
- [ ] INT-0223 validar atualização otimista ou refetch controlado ao mover task entre colunas.
- [ ] INT-0224 eliminar dependência do store local para CRUD principal de tasks.

### Testes e Validação

- [ ] INT-0231 adicionar testes unitários do repository e dos serviços de tasks no backend.
- [ ] INT-0232 adicionar testes unitários do `tasksService` e hooks no frontend.
- [ ] INT-0233 adicionar teste de integração do board cobrindo criar, editar, mover e arquivar task.
- [ ] INT-0234 executar validação manual: criar task vinculada a projeto, mover entre colunas, recarregar e confirmar persistência.

## Fase 3 - Today

### Objetivo

Persistir a sessão diária e o pulse tracking, reduzindo perda de estado ao refresh ou troca de dispositivo.

### Backend

- [ ] INT-0301 revisar o módulo `cycle` e definir o contrato alvo para sessão diária.
- [ ] INT-0302 criar schema para `cycleSessions` com referência ao usuário, data da sessão, estado, horário de início e horário de fechamento.
- [ ] INT-0303 criar schema para `pulseRecords` com referência ao usuário, data, sequência do pulse, minutos confirmados e metadados relevantes.
- [ ] INT-0304 criar endpoints `GET /cycle/session`, `PATCH /cycle/session`, `POST /cycle/pulse` e `GET /cycle/pulse-records`.
- [ ] INT-0305 garantir regra de idempotência mínima para evitar duplicidade de pulse por janela curta.
- [ ] INT-0306 alinhar timezone e boundary de virada do dia no backend.

### Frontend

- [ ] INT-0311 criar `frontend/src/modules/today/services/todayService.ts`.
- [ ] INT-0312 criar `frontend/src/modules/today/queries/todayKeys.ts`.
- [ ] INT-0313 criar `useTodaySessionQuery`.
- [ ] INT-0314 criar `usePulseRecordsQuery`.
- [ ] INT-0315 criar `useFirePulseMutation`.
- [ ] INT-0316 criar `useUpdateTodaySessionMutation`.
- [ ] INT-0317 adaptar `TodayPlannerOverview` para hidratar o estado inicial a partir do backend.
- [ ] INT-0318 adaptar `useActivityPulse` para persistir pulse no servidor.

### Integração

- [ ] INT-0321 definir quais partes do estado diário permanecem apenas locais e quais passam a ser source of truth do backend.
- [ ] INT-0322 garantir recuperação da sessão após refresh sem quebrar a experiência atual do fluxo de hoje.
- [ ] INT-0323 alinhar cálculo de boundary local com timezone e regras do backend.
- [ ] INT-0324 validar fechamento de sessão com persistência do resumo do dia.

### Testes e Validação

- [ ] INT-0331 adicionar testes do contrato de sessão e pulse no backend.
- [ ] INT-0332 adicionar testes dos hooks e serviços de `today` no frontend.
- [ ] INT-0333 adicionar teste de integração cobrindo retomada da sessão após reload.
- [ ] INT-0334 executar validação manual: iniciar sessão, registrar pulse, recarregar e fechar o dia.

## Fase 4 - Weekly

### Objetivo

Conectar a tela semanal a dados persistidos e permitir histórico confiável além da projeção calculada localmente.

### Backend

- [ ] INT-0401 definir se a origem da visão semanal será snapshot persistido, cálculo sob demanda ou abordagem híbrida.
- [ ] INT-0402 criar contrato para `GET /weekly/snapshots` com filtro por semana.
- [ ] INT-0403 criar contrato para `GET /weekly/history` com tendência das semanas anteriores.
- [ ] INT-0404 implementar schema persistido caso a decisão seja por snapshot materializado.
- [ ] INT-0405 implementar service ou use-case que consolide horas planejadas, horas reais e desvio por projeto e por dia.

### Frontend

- [ ] INT-0411 criar `frontend/src/modules/weekly/services/weeklyService.ts`.
- [ ] INT-0412 criar `frontend/src/modules/weekly/queries/weeklyKeys.ts`.
- [ ] INT-0413 criar `useWeeklySnapshotQuery`.
- [ ] INT-0414 criar `useWeeklyHistoryQuery`.
- [ ] INT-0415 adaptar `WeeklyBalanceWorkspace` para consumir dados do backend onde houver histórico confirmado.
- [ ] INT-0416 preservar cálculo local apenas onde a semana corrente ainda depender de sessão aberta.

### Integração

- [ ] INT-0421 alinhar o formato do dado semanal com os tipos já usados pela grade semanal no frontend.
- [ ] INT-0422 definir regra clara para distinguir dados provisórios e dados fechados.
- [ ] INT-0423 garantir dependência correta entre tasks, today e weekly para não gerar números conflitantes.

### Testes e Validação

- [ ] INT-0431 adicionar testes do cálculo ou montagem do snapshot semanal no backend.
- [ ] INT-0432 adicionar testes dos hooks e mapeamentos do módulo weekly no frontend.
- [ ] INT-0433 executar validação manual: comparar semana atual, recarregar e consultar histórico anterior.

## Fase 5 - Settings

### Objetivo

Persistir preferências do usuário e conectar a tela de configurações ao backend além do escopo atual de autenticação.

### Backend

- [ ] INT-0501 definir o conjunto inicial de preferências persistidas: `timezone`, `notificationsEnabled`, `dailyReviewTime`, `cycleStartHour`.
- [ ] INT-0502 estender o schema de usuários ou criar schema dedicado de preferências.
- [ ] INT-0503 criar endpoint `GET /users/settings` ou incorporar preferências em `GET /auth/session`.
- [ ] INT-0504 criar endpoint `PATCH /users/settings` para atualização parcial.
- [ ] INT-0505 avaliar necessidade de endpoint para desvincular conta Google com segurança.

### Frontend

- [ ] INT-0511 criar `frontend/src/modules/auth/services/settingsService.ts`.
- [ ] INT-0512 criar `frontend/src/modules/auth/queries/settingsKeys.ts`.
- [ ] INT-0513 criar `useUserSettingsQuery`.
- [ ] INT-0514 criar `useUpdateUserSettingsMutation`.
- [ ] INT-0515 adaptar `AuthSettingsWorkspace` para exibir e editar preferências persistidas.
- [ ] INT-0516 refletir timezone persistido nas regras de boundary e sessão quando aplicável.

### Integração

- [ ] INT-0521 alinhar o carregamento inicial de settings com a sessão autenticada.
- [ ] INT-0522 garantir que mudanças de timezone impactem corretamente `Today` e `Weekly`.
- [ ] INT-0523 decidir se configurações entram em cache separado ou junto da sessão autenticada.

### Testes e Validação

- [ ] INT-0531 adicionar testes do fluxo de leitura e atualização de settings no backend.
- [ ] INT-0532 adicionar testes dos hooks e formulário de settings no frontend.
- [ ] INT-0533 executar validação manual: alterar timezone ou horário base, recarregar e confirmar persistência.

## Dependências Entre Domínios

- `Projects` deve ser integrado antes de `Tasks`, porque tasks dependem de projeto persistido.
- `Tasks` deve avançar antes de `Weekly`, porque parte da leitura semanal depende da carga real das tasks.
- `Today` e `Settings` compartilham dependência de timezone e boundary operacional.
- `Weekly` deve ser fechado apenas depois que a estratégia de persistência de `Today` estiver definida.

## Riscos Principais

- O frontend hoje concentra parte relevante da lógica de domínio em estado local e utilitários; migrar isso sem regressão exige integração incremental.
- `Today` tem maior risco por combinar estado temporal, pulse tracking, boundary de dia e recuperação de sessão.
- `Weekly` pode divergir facilmente se o backend e o frontend calcularem métricas com regras diferentes.
- `Settings` parece simples, mas pode impactar diretamente o comportamento de `Today` e `Weekly` por causa de timezone.

## Sequência de Entrega Sugerida

1. Fechar a foundation de integração.
2. Integrar `Projects` de ponta a ponta e estabilizar o padrão service/query/mutation.
3. Implementar backend de `Tasks` e migrar o board para persistência real.
4. Persistir a sessão de `Today` e validar recuperação após reload.
5. Fechar `Weekly` sobre contratos consistentes e dados confiáveis.
6. Finalizar `Settings` com preferências persistidas e impacto em timezone.