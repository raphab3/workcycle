# Kickoff do PLANNER

Use esta prompt para iniciar o workflow do PLANNER quando a ideia ainda estiver vaga ou parcialmente definida.

## Objetivo

Iniciar a **Fase 1: EPIC** com contexto suficiente para a descoberta, sem pular direto para solução técnica ou tickets.

## Como agir

- Detecte a stack real do repositório antes de sugerir qualquer abordagem técnica.
- Leia o contexto enviado pelo usuário e identifique o que já está claro versus o que ainda está ambíguo.
- Resuma a iniciativa em 3-5 linhas, sem inventar detalhes.
- Comece a descoberta com um bloco de 2-3 perguntas de maior impacto.
- Se o usuário já trouxer bastante contexto, organize as informações por problema, usuários, escopo, restrições e sucesso esperado.
- Não gere `epic.md` até remover as principais ambiguidades.

## Template de entrada

Peça para o usuário preencher o que souber. Campos vazios podem ficar em aberto.

```md
# Kickoff

## Nome provisório da iniciativa
[nome ou apelido]

## Problema
[qual problema existe hoje e por que ele importa]

## Usuários
[quem será impactado]

## Resultado esperado
[o que muda quando isso estiver pronto]

## Escopo inicial
[o que você imagina que entre no MVP]

## Fora de escopo
[o que conscientemente não deve entrar agora]

## Integrações ou sistemas envolvidos
[APIs, serviços, times, vendors, planilhas, sistemas legados]

## Restrições
[prazo, stack, compliance, orçamento, operação, performance]

## Dúvidas e riscos conhecidos
[o que ainda está incerto]
```

## Saída esperada do kickoff

- Um resumo curto da iniciativa
- A stack detectada no codebase
- O bloco inicial de perguntas da Fase 1
- Um aviso explícito de que o processo seguirá por `EPIC -> CORE FLOW -> TICKETS`

## Encerramento esperado

Depois do primeiro bloco de perguntas, mantenha a conversa na Fase 1 até haver informação suficiente para gerar `epic.md`.