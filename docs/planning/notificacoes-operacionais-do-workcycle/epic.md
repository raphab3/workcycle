# Epic: Notificações Operacionais do WorkCycle

> **Status:** Proposto | **Data:** 2026-03-22 | **Stack detectada:** Monorepo com backend NestJS + Fastify + TypeScript + Drizzle + PostgreSQL e frontend Next.js 14 App Router + React 18 + TypeScript + React Query + Axios + Zustand + Jotai + Zod

## Problema

O WorkCycle já possui sinais operacionais importantes do dia, especialmente na experiência de Hoje, mas ainda não possui uma camada de notificações do produto que transforme esses sinais em lembretes confiáveis, configuráveis e respeitosos.

Hoje o pulso de atividade já existe no frontend como timer local. Ele agenda disparo a cada 30 minutos, expira em 5 minutos quando não respondido e coloca a sessão em estado pausada por inatividade. Isso resolve a lógica interna da sessão, mas não resolve o problema de entrega ao usuário. O produto ainda não define como alertar quando a aba perde foco, quando o app está em background, quando o navegador suspende timers, quando o áudio é bloqueado, quando a permissão de notificação é negada ou quando o usuário retorna depois de uma ausência.

Ao mesmo tempo, Settings já caminha para persistir preferências operacionais como timezone, notifications enabled e daily review time, mas ainda não existe uma fronteira clara entre preferências persistidas, eventos operacionais do Today e a política de entrega dessas notificações no frontend e no backend.

Este epic existe para introduzir notificações operacionais do produto WorkCycle, voltadas ao uso individual e ao dia de trabalho, sem virar sistema de marketing e sem prometer push em tempo real como requisito do MVP. A entrega precisa cobrir pulso de atividade, revisão diária, eventos operacionais importantes do Today e preferências mínimas de entrega, deixando explícito o comportamento degradado quando o browser não puder garantir notificação.

## Usuários

| Perfil | Descrição | Principal necessidade |
|--------|-----------|----------------------|
| Usuário individual do WorkCycle | Pessoa que organiza o próprio dia dentro do produto | Receber lembretes operacionais úteis sem ruído nem sensação de vigilância |
| Usuário em PWA ou web no Linux | Pessoa que usa o WorkCycle no navegador ou como app instalado | Entender quando o produto conseguiu notificar, quando não conseguiu e qual é o estado atual da sessão |
| Usuário que alterna entre foco, abas e reuniões | Pessoa que passa parte do dia fora da aba ativa do WorkCycle | Não perder pulsos e revisões importantes, mas também não receber repetição sonora ou alertas stale |

## Visão de Sucesso

- [ ] O pulso de atividade do Today pode disparar lembrete operacional visível quando a sessão está em andamento e o contexto do browser permite entrega
- [ ] Se o pulso não for respondido em até 5 minutos, a sessão entra em pausada por inatividade e o produto não continua repetindo alerta sonoro enquanto esse estado persistir
- [ ] A revisão diária usa o horário persistido em Settings e respeita o timezone operacional do usuário
- [ ] Eventos operacionais importantes do Today têm política de notificação definida, deduplicada e compatível com uso individual
- [ ] Settings expõe o estado de ativação das notificações, o status de permissão do navegador e o mínimo de preferências necessário para o MVP operacional
- [ ] Quando a permissão for negada, o áudio for bloqueado, a aba estiver em background com limitações, o app estiver fechado ou os timers tiverem sido suspensos, o produto entra em modo degradado explícito e oferece recuperação ao retomar
- [ ] O MVP permanece coerente sem push cross-device e sem prometer entrega garantida fora do contexto real que o browser suporta

## Escopo

### Dentro do Escopo

- Introduzir uma camada explícita de notificações operacionais no frontend, separada das regras de sessão do Today e das preferências de Settings
- Entregar notificação in-app para contexto visível, retomada do app e recuperação de lembretes perdidos
- Entregar notificação do navegador quando houver permissão concedida e suporte disponível no browser
- Integrar o pulso de atividade do Today à camada de notificações, cobrindo disparo do lembrete, expiração do pulso e supressão de repetição durante pausada por inatividade
- Notificar o início de um pulso aguardando confirmação
- Notificar a transição para sessão pausada por inatividade com linguagem informativa e não punitiva
- Entregar lembrete de revisão diária com base em daily review time e timezone persistidos
- Expor em Settings uma área operacional de notificações separada da área atual de conta e autenticação Google
- Reaproveitar notifications enabled e daily review time como base de preferência persistida
- Fechar o contrato mínimo de preferências operacionais entre backend e frontend, definindo claramente o que é persistido no servidor e o que é apenas estado local do browser
- Tratar estados degradados para permissão negada, API indisponível, áudio bloqueado, aba em background, timers suspensos e retomada após ausência
- Ao retomar o app, reconciliar lembretes perdidos e apresentar estado pendente de forma visível, em vez de disparar múltiplas notificações retroativas
- Garantir que a linguagem do produto evite tom de vigilância, cobrança excessiva ou sensação de monitoramento
- Preservar fronteiras de domínio claras entre Settings, Today e Notifications
- Manter o recorte centrado em uso individual do produto

### Fora do Escopo

- Notificações de marketing, onboarding, reengajamento comercial ou campanhas
- Push em tempo real via FCM, APNs ou Web Push como requisito obrigatório do MVP
- Entrega garantida cross-device com o app fechado
- Centro de notificações completo com histórico longo, filtros e caixa de entrada robusta
- Integrações de notificação por email, SMS, WhatsApp, Slack ou outros canais externos
- Regras automáticas complexas por projeto, task, prioridade ou agenda de equipe
- Modo foco completo mencionado no PRD como v2
- Colaboração multiusuário, notificações entre pessoas ou ownership compartilhado
- Reescrita estrutural ampla do Today além do que for necessário para emitir eventos operacionais compatíveis com a nova camada de notificações

## Contexto Técnico

- **Stack:**
  - Backend: NestJS, Fastify, TypeScript, Drizzle, PostgreSQL
  - Frontend: Next.js 14 App Router, React 18, TypeScript, React Query, Axios, Zustand, Jotai, Zod

- **Sinais reais já existentes no repositório:**
  - O PRD já menciona modo foco, que silencia notificações, mas isso está posicionado como v2
  - A descoberta operacional do Today já define pulso de atividade a cada 30 minutos
  - A descoberta operacional do Today já define expiração em 5 minutos e transição para sessão pausada por inatividade
  - A descoberta operacional do Today também define que pulsos futuros durante a pausa não devem gerar notificação sonora repetida
  - O frontend já possui lógica local de timers para disparar e expirar pulso de atividade
  - O frontend ainda não implementa canal de notificação do navegador, centro de notificações nem entrega cross-device
  - O frontend hoje possui workspace de autenticação Google em Settings, mas não um workspace próprio de preferências operacionais e notificações
  - O backend já prevê persistência de preferências de Settings em planejamento prévio, incluindo timezone, notifications enabled, daily review time e cycle start hour
  - A documentação de arquitetura do backend só cita uma fila genérica de notificações, mas não existe módulo funcional de notificações implementado em backend

- **Direção técnica para o MVP:**
  - Today continua dono da sessão operacional, do pulso, da expiração por inatividade e do estado de revisão de fechamento do dia
  - Settings continua dono das preferências persistidas do usuário, incluindo timezone, notifications enabled e daily review time
  - Notifications passa a ser dono da política de entrega, da seleção de canal, da leitura do estado de permissão do navegador, da deduplicação, da supressão e da recuperação na retomada do app
  - O backend precisa garantir contratos claros para preferências operacionais, mas este epic não assume um motor de entrega outbound com fila, worker ou push server-side no MVP
  - O frontend passa a ser a principal fronteira de entrega em tempo de execução, porque os eventos de pulso e o estado da sessão hoje nascem no contexto da aplicação web

- **Dependências estruturais:**
  - Settings persistidos precisam existir de forma confiável antes de a política de entrega operar de ponta a ponta
  - O timezone operacional do usuário precisa ser canônico para não deslocar a revisão diária
  - O Today precisa manter contrato claro para sessão running, paused_manual, paused_inactivity e completed
  - A experiência de Settings precisa separar preferências operacionais da área de autenticação Google para evitar acoplamento conceitual
  - O frontend precisa tratar recursos reais do browser como Notification API, visibilidade da página, foco da janela e retomada do app como capacidades variáveis, não como garantias

- **Restrições operacionais do recorte:**
  - Em web e PWA, o browser pode suspender timers em background
  - O navegador pode negar permissão ou mudar a permissão depois que o usuário já ativou notificações no produto
  - Áudio e autoplay podem ser bloqueados por política do browser ou do sistema
  - Com o app fechado, não existe garantia de disparo no MVP sem Web Push ou infraestrutura adicional
  - O Linux pode apresentar diferenças práticas entre navegador em aba e PWA instalado
  - O produto não deve simular confiabilidade que não consegue garantir no contexto real do browser

- **Edge cases obrigatórios do epic:**
  - Usuário ativou notifications enabled em Settings, mas a permissão do navegador continua negada
  - O pulso vence enquanto a aba está em background e o usuário só retorna depois da expiração
  - A sessão já está em pausada por inatividade e o produto não pode continuar emitindo som repetitivo a cada novo ciclo previsto
  - O usuário recarrega a página ou retoma o app depois de um período longo e o sistema precisa evitar duplicação de alertas
  - A revisão diária cai em horário em que o app não está aberto e o produto precisa degradar para lembrete pendente na próxima retomada
  - A permissão de notificação é concedida ou revogada no meio do dia e a camada de entrega precisa reagir sem estado inconsistente
  - Um alerta do navegador é clicado depois que a sessão já mudou de estado e o produto não pode reabrir contexto stale como se fosse atual
  - Mudança de timezone ou de daily review time precisa ter regra previsível para os próximos agendamentos operacionais

## Riscos & Suposições

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| O produto transmitir falsa sensação de entrega garantida em web ou PWA | Alto | assumir explicitamente modelo best effort, exibir estado degradado e tratar retomada como fluxo de recuperação |
| Duplicação de alertas após reload, retomada de aba ou reconciliação local | Alto | centralizar deduplicação por evento operacional, timestamp e estado atual da sessão |
| Permissão negada no navegador gerar UX confusa apesar de notifications enabled estar ativo em Settings | Alto | separar claramente preferência do produto e permissão do browser, com mensagens específicas para cada caso |
| Repetição sonora durante pausada por inatividade gerar ruído e rejeição do recurso | Alto | aplicar política explícita de supressão enquanto a sessão permanecer pausada por inatividade |
| Revisão diária disparar no horário errado por conflito de timezone | Alto | tratar timezone como dependência operacional obrigatória e definir regra única para reagendamento |
| Contrato de Settings atual ser genérico demais para o recorte de notificações operacionais | Médio | fechar contrato mínimo no Core Flow antes dos tickets, distinguindo o que é persistido e o que é local |
| Linguagem do pulso e da inatividade soar como vigilância | Médio | revisar cópia e nomenclatura com foco em ritmo operacional e autoconsciência, não em controle |
| A camada de notificações ficar acoplada ao Today e impedir evolução futura | Médio | manter módulo próprio de Notifications no frontend e contratos explícitos entre domínios |
| Backend ser superdimensionado cedo com fila ou worker desnecessário | Médio | limitar o MVP a contratos de preferências e à entrega client-side enquanto não houver requisito explícito de push |

## Suposições explícitas

- O usuário alvo deste epic é individual
- As notificações deste epic são operacionais, não promocionais
- O MVP não exige push em tempo real nem entrega garantida com o app fechado
- A primeira versão deve operar com notificação in-app e notificação do navegador quando suportada
- O frontend é a fronteira principal de entrega para pulso de atividade, porque esse evento já nasce localmente na sessão do Today
- Settings já é a origem natural das preferências persistidas de notificações e horário de revisão diária
- O produto deve preferir recuperação na retomada do app a tentar simular notificações retroativas em lote
- O modo foco completo continua fora do escopo deste epic e só deve ser citado como compatibilidade futura

## Decisões Consolidadas

- O lembrete de revisão diária só deve existir em dias com contexto operacional ativo.
- O MVP não terá som próprio do produto; os canais iniciais são notificação do navegador quando suportada e UI in-app.
- O produto deve registrar histórico curto persistido de lembretes para depuração operacional e UX.
- A área de notificações em Settings nasce no primeiro corte com affordances extras: ação de teste, preview dos lembretes e explicitação do estado degradado.

---
*Gerado por PLANNER — Fase 1/3*