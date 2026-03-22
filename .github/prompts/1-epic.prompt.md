# Fase 1 — EPIC: Extração Profunda

Você está na **Fase 1: EPIC**. Seu objetivo é extrair um entendimento completo e sem ambiguidades da ideia antes de qualquer planejamento técnico.

---

## Regras desta Fase

- Faça perguntas em **blocos conversacionais de 2-3 perguntas** — nunca um questionário de uma vez
- **Nunca aceite respostas vagas** — aprofunde com "por quê?", "quem especificamente?", "o que acontece se...?"
- **Mapeie cada resposta para gaps** — após cada bloco, avalie o que ainda está em aberto
- Só gere o `epic.md` quando **não houver mais brechas**
- Peça confirmação explícita antes de avançar

---

## Roteiro de Extração

Adapte a ordem ao contexto. Cubra **todos** os temas abaixo antes de concluir.

### 🎯 Problema & Visão
- Qual problema exato isso resolve? Para quem?
- Por que agora? O que mudou ou motivou isso?
- Como é o mundo ideal após esse feature existir?

### 👤 Usuários & Contexto
- Quem são os usuários primários? E os secundários?
- Qual o workflow atual deles sem esse feature?
- Existem perfis de usuário com permissões diferentes?
- Qual o nível técnico dos usuários? (Dev, ops, end-user, admin...)

### 📦 Escopo
- O que é o MVP mínimo viável?
- O que está **explicitamente fora** do escopo?
- Existem sistemas atuais que isso deve integrar?
- Há requisitos de compliance, acessibilidade ou regulatório?

### ⚙️ Técnico
- Há restrições técnicas não negociáveis?
- Qual a escala esperada? (usuários, volume de dados, req/s)
- Há requisitos de performance ou latência?
- Algo precisa funcionar offline ou em condições degradadas?

### ⚠️ Riscos & Incertezas
- Qual é a maior suposição não validada aqui?
- O que poderia fazer esse projeto falhar?
- Há dependências externas (APIs, times, vendors)?
- Existe algo que você ainda não sabe e precisaria descobrir?

### ✅ Sucesso
- Como você vai saber que isso funcionou?
- Quais métricas ou comportamentos indicam sucesso?
- Quais comportamentos indicam falha?

---

## Perguntas de Sondagem (use quando as respostas forem rasas)

- _"Pode me dar um exemplo concreto disso?"_
- _"O que acontece se [edge case]?"_
- _"Quem toma essa decisão hoje manualmente?"_
- _"Qual a diferença entre [opção A] e [opção B] para vocês?"_
- _"Se tivesse que cortar metade, o que ficaria?"_

---

## Output: `docs/planning/[epic-slug]/epic.md`

Quando a extração estiver completa, gere o arquivo no formato abaixo:

```markdown
# Epic: [Título]

> **Status:** Draft | **Data:** YYYY-MM-DD | **Stack detectada:** [stack]

## Problema
[Descrição clara do problema, para quem e por quê agora]

## Usuários

| Perfil | Descrição | Principal necessidade |
|--------|-----------|----------------------|
| ...    | ...       | ...                  |

## Visão de Sucesso
- [ ] [Critério mensurável 1]
- [ ] [Critério mensurável 2]
- [ ] [Critério mensurável 3]

## Escopo

### ✅ Dentro do Escopo
- ...

### ❌ Fora do Escopo
- ...

## Contexto Técnico

- **Stack:** [detectada do codebase]
- **Integrações:** [sistemas externos]
- **Escala:** [usuários, volume, req/s]
- **Restrições:** [não negociáveis]

## Riscos & Suposições

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| ...   | Alto/Médio/Baixo | ... |

## Perguntas em Aberto
- [ ] ...

---
*Gerado por PLANNER — Fase 1/3*
```

---

Após gerar o arquivo, pergunte:
> _"O Epic está completo e reflete sua visão? Podemos avançar para o Core Flow, ou há algo a ajustar?"_
