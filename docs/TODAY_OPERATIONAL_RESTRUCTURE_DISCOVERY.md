# WorkCycle - Today Operational Restructure Discovery

> Documento de alinhamento previo ao update do PRD. Objetivo: separar a tela Hoje em uma experiencia operacional e mover a leitura analitica mais densa para uma futura Dashboard page.

## Contexto

A tela Hoje atual concentra quatro naturezas diferentes de uso:

- analise de contexto do ciclo
- configuracao e redistribuicao do plano
- execucao operacional do trabalho
- fechamento manual do dia

Isso torna a tela boa para leitura, mas pesada para a acao principal do produto: ajudar o dev a entrar no dia, executar o combinado, registrar o tempo real e perceber cedo quando esta saindo do plano.

O feedback do usuario aponta uma direcao mais adequada:

- criar uma page de Dashboard para analise
- transformar a page Hoje em uma ferramenta operacional de acompanhamento do dia

## Problema da tela atual

Hoje a tela mistura blocos que competem entre si por atencao:

- contexto do ciclo
- sugestao de redistribuicao
- configuracao do ciclo
- tasks alocadas no cycle
- escala sugerida
- fechamento do dia com horas reais
- resumo de carga vindo das tarefas

Essa composicao faz sentido como painel de leitura, mas nao como tela de uso continuo ao longo do dia. O fluxo operacional fica diluido e a acao principal nao tem um centro claro.

## Direcao proposta

### 1. Criar uma Dashboard page

Esta nova page passa a concentrar leitura, analise e acompanhamento mais estrategico.

Sugestao de blocos que devem sair da tela Hoje e migrar para Dashboard:

- contexto do ciclo
- cards de risco e leitura operacional macro
- sugestao de redistribuicao de percentual
- resumo de carga vindo das tarefas
- leitura mais ampla de equilibrio entre projetos

Objetivo da Dashboard:

- ajudar a entender o estado do plano
- apoiar decisoes de redistribuicao
- mostrar sinais de risco, pressao e desequilibrio
- servir como page de analise, nao como cockpit de execucao

### 2. Redefinir a page Hoje como page operacional

A page Hoje deve responder a uma pergunta mais objetiva:

> O que eu estou fazendo agora, quanto do dia ja executei, estou no ritmo do combinado, e o que preciso ajustar para terminar bem?

## Objetivos da nova page Hoje

- iniciar formalmente a jornada de trabalho
- confirmar a disponibilidade e a distribuicao recomendada do dia
- escolher qual projeto esta ativo agora
- registrar o tempo real de execucao por projeto ao longo do dia
- manter o board do dia funcional para puxar, devolver, iniciar e concluir tasks
- acompanhar progresso do dia e atraso em relacao ao plano
- permitir ajuste operacional sem obrigar o dev a navegar por uma tela analitica
- manter apenas uma secao compacta de dados principais do dia

## Conceito central sugerido

O centro da page Hoje deixa de ser a "escala" e passa a ser a "sessao de trabalho do dia".

Essa sessao organiza:

- inicio de jornada
- projeto ativo no momento
- pulsos periodicos de confirmacao de atividade
- tempo real acumulado
- progresso contra o planejado
- ajuste fino do fechamento

## Proposta de nomenclatura

### Para a ferramenta de check-in

O termo "check-in" funciona, mas pode ser melhorado para ficar menos associado a controle e mais a ritmo operacional.

Opcoes:

- Pulso de atividade
- Pulso de foco
- Ritmo de trabalho
- Confirmacao de atividade

Recomendacao atual:

- usar "Pulso de atividade" para o evento recorrente a cada 30 minutos
- usar "Sessao de trabalho" para o estado geral do dia

### Para o estado hoje chamado de skipped

"Skipped" passa uma sensacao tecnica e pouco humana. Como o objetivo e inferir ausencia de atividade, nomes melhores seriam:

- sem confirmacao
- inatividade detectada
- janela inativa
- atividade nao confirmada

Recomendacao atual:

- usar "atividade nao confirmada" para o registro do pulso
- usar "sessao pausada por inatividade" para o estado da sessao

## Fluxo operacional proposto para a page Hoje

1. O dev abre a page Hoje.
2. O sistema mostra a distribuicao recomendada do dia de forma compacta.
3. O dev confirma ou ajusta rapidamente disponibilidade e distribuicao.
4. O dev inicia a sessao de trabalho.
5. O dev escolhe o projeto inicial ativo.
6. O board do Hoje passa a operar em torno desse projeto e das tasks do dia.
7. A cada 30 minutos, um pulso de atividade pede confirmacao.
8. Se o pulso nao for respondido em ate 5 minutos, as notificacoes param e a sessao entra em estado pausado por inatividade.
9. Os proximos pulsos previstos podem ser marcados automaticamente como atividade nao confirmada ate o usuario retomar a sessao.
10. O dev pode regularizar retroativamente os pulsos e os blocos de tempo, dentro de uma regra ainda a validar.
11. Ao longo do dia, o sistema compara tempo real contra tempo planejado por projeto e para o dia total.
12. No fim do dia, o fechamento manual consolida horas reais e ajustes finais em um ponto mais funcional do fluxo.

## Estrutura sugerida da nova page Hoje

### 1. Barra principal da sessao de trabalho

Bloco de maior destaque da page.

Deve exibir:

- estado da sessao: nao iniciada, em andamento, pausada, encerrada
- hora de inicio
- tempo total decorrido
- proximo pulso em contagem regressiva
- acao primaria: iniciar, pausar, retomar ou encerrar sessao
- projeto ativo atual

Esse bloco e o verdadeiro substituto do papel central que hoje esta espalhado entre "Configurar ciclo", "Escala sugerida" e "Fechamento do dia".

### 2. Resumo compacto do dia

A page deve manter apenas uma faixa compacta de analytics principais.

Sugestao de metricas:

- horas planejadas no dia
- horas reais registradas
- saldo do dia
- status de ritmo: adiantado, no ritmo, atrasado
- tasks concluidas hoje

Objetivo:

- dar leitura imediata sem transformar a page em dashboard

### 3. Confirmacao operacional do plano do dia

No inicio da jornada, o dev precisa ver e validar rapidamente:

- horas disponiveis hoje
- distribuicao recomendada entre projetos
- quais projetos entraram no dia

Esse bloco deve ser muito mais enxuto do que o painel atual.

Recomendacao:

- mostrar como etapa compacta inicial
- depois de iniciada a sessao, colapsar esse conteudo
- permitir replanejamento controlado, sem manter o formulario aberto o tempo inteiro

### 4. Seletor de projeto ativo

Esse e um ponto central da operacao.

O dev precisa conseguir:

- escolher com qual projeto vai iniciar
- alternar de projeto durante o dia
- ver qual projeto esta ativo agora
- enxergar tempo planejado vs tempo real daquele projeto
- adicionar ou reduzir horas registradas quando necessario

Regra proposta:

- somente um projeto pode estar ativo por vez
- trocar de projeto encerra o bloco ativo anterior e inicia outro bloco

## 5. Board operacional do Hoje

O card "Tasks alocadas no cycle" deve deixar de ser uma lista geral do dia e passar a ser um board filtrado pelo projeto selecionado.

Direcao confirmada pelo usuario:

- 3 colunas fixas: Backlog, In Progress e Done

Capacidades desejadas:

- puxar tasks para o Hoje
- remover tasks do Hoje e devolver ao backlog
- ao iniciar trabalho em um projeto, suas tasks relevantes podem ir para In Progress
- concluir task pela propria page Hoje
- manter sincronismo simples com o board do produto

Sugestao de leitura operacional:

- o board mostra somente o projeto ativo ou selecionado
- o dev pode trocar o projeto selecionado a qualquer momento
- cada mudanca relevante no board gera evento para analytics

## 6. Progresso do dia

Esse bloco e essencial e deve ficar visivel durante toda a jornada.

Precisa responder:

- o tempo distribuido sera suficiente?
- eu estou atrasado ou no ritmo?
- ainda posso puxar mais tasks?
- qual projeto esta consumindo mais ou menos do que o previsto?

Indicadores sugeridos:

- progresso total do dia: real vs planejado
- progresso do projeto ativo: real vs planejado
- capacidade restante do dia
- risco de extrapolar a disponibilidade
- margem para adicionar mais trabalho

Recomendacao:

- nao usar so "horas registradas"
- usar leitura de ritmo comparando horario atual, horas executadas e meta prevista ate este momento do dia

## 7. Fechamento do dia com horas reais

O conceito atual foi bem avaliado, mas esta num lugar pouco funcional.

Recomendacao:

- transformar o fechamento em um painel contextual de encerramento
- esse painel pode abrir como drawer, sheet ou bloco fixado no rodape quando o saldo do dia estiver perto do fim
- concentrar ajustes finais e consolidacao, nao o registro inteiro do dia

Papel do fechamento:

- revisar blocos do dia
- ajustar horas finais por projeto
- validar saldo do dia
- encerrar sessao

## O que manter fora da page Hoje

Para a page Hoje continuar operacional, evitar manter nela:

- leituras analiticas amplas de carteira
- comparativos mais densos de redistribuicao percentual
- listas gerais de carga de todos os projetos
- sinais editoriais demais que nao ajudam na execucao imediata
- cards de analise que nao levam a uma acao operacional clara

## Eventos e dados que valem ouro para analytics

Se a page Hoje vai virar a principal superficie operacional, ela precisa salvar eventos que depois alimentem analise real.

Eventos recomendados:

- inicio da sessao de trabalho
- pausa manual
- pausa por inatividade
- retomada da sessao
- encerramento da sessao
- confirmacao do pulso de atividade
- pulso sem resposta
- regularizacao retroativa de pulso
- troca de projeto ativo
- ajuste manual de horas por projeto
- aceitacao ou edicao da distribuicao recomendada
- task puxada para o Hoje
- task devolvida ao backlog
- task movida para In Progress
- task concluida

Dados derivados importantes:

- tempo real por projeto
- tempo planejado vs realizado por projeto
- tempo ocioso ou nao confirmado
- quantidade de trocas de contexto no dia
- tempo medio entre pulsos confirmados
- taxa de aderencia ao plano do dia
- desvio entre distribuicao recomendada e distribuicao executada

## Regras de produto sugeridas

Estas regras ainda precisam de validacao, mas ajudam a desenhar o sistema com coerencia.

### Sessao de trabalho

- uma sessao por dia pode conter multiplos blocos de atividade
- somente uma sessao fica ativa por vez
- somente um projeto fica ativo por vez dentro da sessao

### Pulso de atividade

- o pulso dispara a cada 30 minutos apenas enquanto a sessao estiver ativa
- se o usuario nao responder em 5 minutos, a sessao entra em pausa por inatividade
- pulsos futuros durante a pausa nao geram notificacao sonora repetida
- esses pulsos podem ser marcados automaticamente como atividade nao confirmada

### Tempo real

- trocar o projeto ativo gera um novo bloco de tempo
- ajustes manuais podem complementar os blocos capturados pela sessao
- toda alteracao manual deve ficar registrada para auditoria analitica

### Board do Hoje

- as colunas sao fixas: Backlog, In Progress e Done
- puxar task para o Hoje nao precisa significar concluir no mesmo dia
- devolver task ao backlog remove da lista operacional do dia
- concluir task na page Hoje deve refletir no board global

## Mapeamento inicial da tela atual para a nova arquitetura

### Migrar para Dashboard

- contexto do ciclo
- suggestion banner
- resumo de carga vindo das tarefas
- leitura ampla de risco e pressao
- sinais editoriais macro do dia

### Permanecer em Hoje, mas reformatado

- configuracao do ciclo, como confirmacao inicial compacta
- escala do dia, como plano resumido e nao como grande card analitico
- fechamento do dia, como ferramenta contextual de encerramento

### Nascer como novos blocos de Hoje

- sessao de trabalho
- pulso de atividade
- projeto ativo
- progresso do dia em tempo real
- board por projeto selecionado
- trilha de eventos para analytics

## Duvidas para validar antes de atualizar o PRD

1. A nova Dashboard sera uma rota dedicada, por exemplo `/dashboard`, ou voce imagina que ela substitua a home atual?
2. A page Hoje deve abrir sempre em estado de preparacao, exigindo confirmacao do plano antes de iniciar a sessao?
3. O usuario pode ter mais de um projeto ativo ao mesmo tempo ou devemos fechar em regra de exclusividade total?
4. Ao trocar de projeto ativo, o tempo deve migrar automaticamente para o novo projeto ou sempre exigir confirmacao?
5. Quando o usuario puxa uma task para o Hoje, isso consome capacidade planejada automaticamente ou e apenas uma decisao visual de fila?
6. Quando o projeto fica ativo, todas as tasks desse projeto devem ir para In Progress ou apenas as tasks explicitamente iniciadas?
7. O que pode ser regularizado retroativamente: apenas o pulso, o projeto ativo, ou tambem os blocos de tempo?
8. Existe uma janela maxima para regularizacao retroativa, por exemplo no mesmo dia apenas?
9. Se o pulso falhar por 5 minutos, a sessao deve pausar automaticamente ou apenas parar as notificacoes mantendo o contador ativo?
10. O fechamento do dia deve ser obrigatorio para consolidar analytics ou pode existir encerramento automatico com pendencias?
11. O dev pode adicionar tarefas manualmente acima da capacidade sugerida se aceitar explicitamente o risco?
12. A distribuicao recomendada do dia deve continuar nascendo do algoritmo atual ou voce quer simplificar essa recomendacao para a experiencia operacional?

## Insights de produto

1. A page Hoje vai funcionar melhor se tiver uma hierarquia muito clara: sessao, projeto ativo, tarefas do projeto, progresso do dia.
2. O board do Hoje nao deve competir com a tela Tarefas; ele deve ser uma superficie de execucao reduzida.
3. O produto ganha muito valor se registrar trocas de contexto. Isso ajuda a mostrar por que o dia ficou atrasado mesmo quando o total de horas bateu.
4. O pulso de atividade precisa ser desenhado com cuidado para nao parecer vigilancia. A linguagem deve reforcar auto-organizacao, nao controle.
5. O estado de "atrasado" precisa considerar o momento do dia, nao apenas horas finais acumuladas.
6. O fechamento do dia fica melhor como consolidacao do que como ferramenta principal de input. O input principal deve acontecer durante a sessao.

## Recomendacao de produto para seguir

Antes de atualizar o PRD, vale fechar quatro decisoes estruturais:

1. qual sera a rota e o papel da nova Dashboard
2. qual a regra exata de pulso, inatividade e regularizacao retroativa
3. qual o comportamento oficial do board do Hoje em relacao a backlog e In Progress
4. qual o nivel de automacao desejado na troca de projeto ativo e no registro de tempo

## Resultado esperado apos a reestruturacao

Se essa direcao for aprovada, a page Hoje passa a ser a tela que o dev deixa aberta enquanto trabalha. A Dashboard vira a tela para leitura, ajuste de rota e analise. Essa separacao deve reduzir carga cognitiva e aproximar o produto do uso diario real.