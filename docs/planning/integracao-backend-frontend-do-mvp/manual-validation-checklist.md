# Checklist de validacao manual — Integracao Backend + Frontend do MVP

## Escopo

Checklist operacional para confirmar o fluxo principal do MVP com backend real nos dominios integrados: Auth, Projects, Tasks, Today, Weekly e Settings.

## Pre-condicoes

- Backend rodando com `backend/.env` valido e banco migrado.
- Frontend rodando com acesso ao backend local.
- Usuario autenticavel disponivel por email/senha ou Google.
- Banco com permissoes para criar e atualizar dados do usuario corrente.

## Auth e sessao

### Login por email
- Acessar `/login`.
- Entrar com email e senha validos.
- Confirmar redirecionamento para `/dashboard`.
- Recarregar a pagina.
- Confirmar que a sessao continua autenticada sem retornar para `/login`.

### Sessao expirada durante fluxo ja iniciado
- Com uma sessao autenticada, disparar uma mutation protegida em Projects ou Settings.
- Expirar manualmente o token ou usar um ambiente com token antigo.
- Confirmar que o cliente tenta `refresh-and-retry` antes de forcar logout.
- Se o refresh falhar, confirmar logout controlado e limpeza de cache.

## Projects

### CRUD principal com persistencia
- Criar um projeto rotativo novo.
- Editar nome e percentual do projeto.
- Alternar status entre `active` e `paused`.
- Recarregar a pagina.
- Confirmar que a lista volta do backend com os dados atualizados, sem depender do mock local.

## Tasks

### Board persistido
- Criar uma task vinculada a um projeto existente.
- Editar titulo ou prioridade.
- Mover a task entre colunas.
- Arquivar a task.
- Recarregar a pagina.
- Confirmar que o board recupera o estado persistido do backend.

## Today

### Sessao diaria e pulse
- Iniciar sessao diaria em um projeto.
- Registrar um pulse ou transicao operacional relevante.
- Recarregar a pagina durante a sessao.
- Confirmar recuperacao da sessao ativa, projeto corrente e historico de pulse.
- Fechar o dia.
- Confirmar que o resumo final continua consistente apos novo reload.

## Weekly

### Semana aberta e historico fechado
- Com sessao autenticada, abrir `/semana`.
- Confirmar que a semana atual vem do backend e exibe aviso de dado provisório quando houver sessao aberta.
- Recarregar a pagina e confirmar que a leitura da semana atual continua consistente.
- Consultar o historico recente.
- Confirmar que semanas fechadas aparecem como persistidas e marcadas como fechadas.

## Settings

### Preferencias persistidas
- Abrir configuracoes autenticadas.
- Alterar `timezone` e `dailyReviewTime`.
- Salvar.
- Recarregar a pagina.
- Confirmar que os valores persistidos retornam do backend.
- Se houver integracao Google ativa, alternar a inclusao de um calendario e confirmar persistencia apos reload.

## Criterios de saida

- Login continua funcional apos reload.
- Projects, Tasks, Today, Weekly e Settings recuperam estado principal do backend.
- Nenhum fluxo principal depende funcionalmente de mock local.
- Divergencias entre Today e Weekly nao aparecem apos refresh e fechamento do dia.