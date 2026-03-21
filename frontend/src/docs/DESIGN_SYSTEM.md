# WorkCycle — System Design Guide

> **The Architectural Editor.** Este sistema de design rejeita a estética "widget-heavy" de ferramentas de produtividade tradicionais. O WorkCycle trata a gestão de tempo como uma experiência editorial de alto padrão — construída, não desenhada. As cores dos projetos são os únicos atores vibrantes no palco. Tudo mais recede.

---

## 1. North Star

**Precisão Arquitetural.** Layout que usa assimetria intencional, espaço negativo generoso e fundo neutro de "galeria" para deixar os dados do usuário em evidência. A hierarquia é comunicada por variações tonais e peso tipográfico — nunca por linhas e bordas.

---

## 2. Tokens de Cor

### Superfícies

As superfícies formam uma pilha de papel fino. Cada camada cria profundidade sem sombra.

| Token | Hex | Uso |
|---|---|---|
| `surface` | `#f8f9fb` | Background base da aplicação |
| `surface_container_low` | `#f0f4f7` | Linhas alternadas, áreas de trabalho secundárias |
| `surface_container` | `#e8eff3` | Sidebar / topbar — âncora estrutural |
| `surface_container_high` | `#dde6eb` | Hover states, steppers, botões secundários |
| `surface_container_highest` | `#d4dee4` | Inputs (soft-well background) |
| `surface_container_lowest` | `#ffffff` | Cards ativos, modais — efeito "levantado" |
| `surface_variant` | `#dde6eb` | Trilha de barras de progresso |
| `outline_variant` | `#a9b4b9` | Ghost border (15% opacity) quando inevitável |

### Marca

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#506169` | Cor principal, textos de ação, foco de inputs |
| `primary_dim` | `#45555d` | Ponto final do gradiente nos botões primários |
| `primary_fixed` | `#cde7f4` | Backgrounds de destaque suave |
| `primary_fixed_dim` | `#c6d7e1` | Surface de status "atenção" |
| `primary_fixed_var` | `#8fa5ae` | MetaLabels, rótulos de metadata |
| `on_primary` | `#ffffff` | Texto sobre botão primário |

### Status

| Token | Hex | Situação |
|---|---|---|
| `tertiary` | `#006b5f` | Equilibrado ✓ · Sucesso · Confirmação |
| `error` | `#9f403d` | Crítico ● · Atrasado · Erro |
| `warning_surface` | `#c6d7e1` | Atenção ⚠ (sofisticado — nunca amarelo gritante) |
| `warning_text` | `#7a6020` | Texto sobre surface de atenção |

### Texto

| Token | Hex | Uso |
|---|---|---|
| `on_surface` | `#2a3439` | Texto principal — nunca `#000000` |
| `on_surface_variant` | `#506169` | Texto secundário, labels |
| `on_surface_muted` | `#8fa5ae` | Metadata, placeholders, itens desabilitados |

### Cores de Projeto

Os projetos usam cores vibrantes — são os únicos elementos que "gritam" na interface. Use a paleta abaixo para os `8–10` projetos. Nunca reutilize a paleta de marca para projetos.

```
#3b82f6  #8b5cf6  #ec4899  #f97316  #14b8a6
#84cc16  #f59e0b  #ef4444  #06b6d4  #a855f7
```

---

## 3. Regra Fundamental: Sem Linhas

**Não use bordas `1px solid` para definir seções ou containers.**

A estrutura deve ser obtida por:

- **Transições tonais** — card `surface_container_lowest` sobre fundo `surface_container_low`
- **Espaço negativo** — tokens de espaçamento `8` (1.75rem) ou `10` (2.25rem) para criar agrupamentos mentais
- **Ghost border como último recurso** — se um container precisar sentar sobre cor idêntica, use `outline_variant` a **15% de opacidade**

```css
/* ✅ Correto — separação por alternância de fundo */
row:nth-child(even)  { background: surface_container_lowest }
row:nth-child(odd)   { background: surface_container_low    }

/* ❌ Errado — borda explícita */
row { border-bottom: 1px solid #e2e8f0 }
```

---

## 4. Tipografia

Estratégia dual: autoridade editorial + legibilidade de dados.

### Fontes

| Fonte | Papel | Escalas |
|---|---|---|
| **Manrope** | A Voz — display editorial, números em destaque | `display`, `headline` |
| **Inter** | O Motor — legibilidade densa em tabelas e formulários | `title`, `body`, `label` |

### Escala

| Escala | Fonte | Size | Weight | Uso |
|---|---|---|---|---|
| `display-lg` | Manrope | 32px | 800 | Títulos de página |
| `headline-lg` | Manrope | 28px | 800 | Headers de seção principais |
| `headline-md` | Manrope | 22px | 700 | Valores numéricos em destaque |
| `title-lg` | Inter | 16px | 600 | Nomes de projetos, títulos de card |
| `title-md` | Inter | 14px | 600 | Rótulos de ação, nomes em lista |
| `body-md` | Inter | 14px | 400 | Texto corrido, descrições |
| `body-sm` | Inter | 13px | 400–500 | Itens de lista, conteúdo de card |
| `label-md` | Inter | 12px | 500 | Labels secundários |
| `label-sm` | Inter | 11px | 600 | MetaLabels em `primary_fixed_var` — UPPERCASE + letter-spacing |

### MetaLabel

Componente especial para rótulos de seção e metadata contextual.

```
Fonte: Inter · 11px · weight 600
Cor: primary_fixed_var (#8fa5ae)
Transform: UPPERCASE
Letter-spacing: 0.04em
```

**Tip:** Use `Manrope` para **números** em visualizações de dados. O caráter geométrico da fonte dá peso "Swiss-style" que o Inter não tem em tamanho grande.

---

## 5. Elevação e Profundidade

Profundidade é uma ferramenta funcional, não decorativa.

### Princípio de Camadas Tonais

```
surface (#f8f9fb)                     ← base da aplicação
  └─ surface_container_low (#f0f4f7)  ← área de trabalho primária
       └─ surface_container_lowest (#ffffff) ← card "levantado"
```

Colocar um card `surface_container_lowest` dentro de uma coluna `surface_container_low` cria um "degrau" natural sem sombra.

### Sombras

- **Elementos estáticos** → sem sombra. Use camadas tonais.
- **Estado flutuante ativo** (ex: card sendo arrastado) → `box-shadow: 0 8px 32px rgba(42,52,57,.08)`
- **Nunca use `#000000` em sombras** → use `on_surface` (#2a3439) para simular luz natural

---

## 6. Componentes

### Botões

#### Primary — Gradiente, ação principal

```css
background: linear-gradient(135deg, #506169 0%, #45555d 100%);
color: #ffffff;
border: none;
border-radius: 8px;
padding: 11px 24px;
font: 600 14px Inter;
```

#### Secondary — Surface fill, ação de suporte

```css
background: surface_container_high (#dde6eb);
color: on_surface_variant (#506169);
border: none;
border-radius: 8px;
padding: 9px 18px;
font: 500 13px Inter;
```

#### Ghost / Tertiary — Ação de baixa ênfase

```css
background: transparent;
color: primary (#506169);   /* ou cor contextual */
border: none;
padding: 9px 16px;
font: 600 13px Inter;
```

**Regra:** Nunca use `border-radius: 9999px` em botões. Apenas `Chips` e `Tags` são pills.

---

### Barras de Progresso

Trilha espessa de 8px — não use 2–4px. É um elemento de visualização de dados, não decorativo.

```css
/* Trilha */
background: surface_variant (#dde6eb);
border-radius: 4px;
height: 8px;

/* Fill normal */
background: [cor do projeto];
border-radius: 4px;
transition: width 0.4s ease;

/* Fill crítico */
background: error (#9f403d);
```

---

### Inputs

Estilo **soft-well** — sem caixa fechada com borda, sem `outline`.

```css
background: surface_container_highest (#d4dee4);
border: none;
border-bottom: 2px solid transparent;   /* repouso */
border-radius: 4px 4px 0 0;
padding: 10px 12px;
font: 400 14px Inter;
color: on_surface;

/* Foco */
border-bottom-color: primary (#506169);
outline: none;
```

---

### Cards

`surface_container_lowest` sobre fundo `surface_container_low` → efeito de papel levantado.

```css
background: surface_container_lowest (#ffffff);
border-radius: 12px;
overflow: hidden;
/* SEM border */
/* SEM box-shadow em repouso */
```

**Accent bar** opcional para projetos:

```css
border-left: 4px solid [cor do projeto];
```

---

### Chips e Tags

Pills para status, tipos e categorias curtas.

```css
display: inline-flex;
align-items: center;
padding: 3px 10px;
border-radius: 9999px;   /* único lugar onde full-radius é permitido */
font: 600 11px Inter;
background: [cor]18;     /* 9% opacidade */
color: [cor];
```

---

### Listas e Tabelas

**Sem divisores horizontais.** Alternância de fundo entre itens.

```css
row:nth-child(even) { background: surface_container_lowest }
row:nth-child(odd)  { background: surface_container_low    }

/* Hover */
row:hover { background: surface_container_high; transition: background 0.1s ease-in }
```

**Gap vertical** entre grupos: `spacing.8` (1.75rem).

---

### Navegação (Topbar)

Topbar usa `surface_container` — âncora visual sem borda.

```css
/* Container */
background: surface_container (#e8eff3);
height: 52px;
padding: 0 32px;
/* SEM border-bottom */

/* Nav pill group */
background: surface_container_high;
border-radius: 8px;
padding: 4px;

/* Nav item ativo */
background: surface_container_lowest;
box-shadow: 0 1px 4px rgba(42,52,57,.06);
font-weight: 600;

/* Nav item inativo */
background: transparent;
color: on_surface_muted;
```

---

## 7. Iconografia e Indicadores

### Status de Desvio

| Ícone | Status | Cor | Critério |
|---|---|---|---|
| `✓` | Equilibrado | `tertiary` #006b5f | Desvio ≤ ±10% |
| `⚠` | Atenção | `warning_text` #7a6020 | Desvio 10–20% |
| `●` | Crítico | `error` #9f403d | Desvio > 20% |

### Tipos de Projeto

| Ícone | Tipo |
|---|---|
| `⚑` | Projeto fixo (aparece em dias configurados) |
| `↻` | Projeto rotativo (entra por déficit/carga) |

---

## 8. Espaçamento

Base: `4px`. Todos os tokens são múltiplos.

| Token | px | rem | Uso típico |
|---|---|---|---|
| `1` | 4px | 0.25rem | Gap mínimo entre ícone e texto |
| `2` | 8px | 0.5rem | Gap entre items de lista — substitui divisor |
| `3` | 12px | 0.75rem | Padding de chips e badges |
| `4` | 16px | 1rem | Padding de linha/item padrão |
| `5` | 20px | 1.25rem | Padding horizontal de card compacto |
| `6` | 24px | 1.5rem | Padding horizontal padrão de card |
| `8` | 32px | 1.75rem | Gap entre seções — separação mental |
| `10` | 40px | 2.25rem | Padding externo da stage/main |
| `12` | 48px | 3rem | Margem de títulos de página |

---

## 9. Border Radius

| Token | px | Uso |
|---|---|---|
| `sm` | 4px | Inputs, accent bars, detalhes internos |
| `md` | 8px | Botões, steppers, itens de navegação |
| `lg` | 12px | Cards, seções de formulário |
| `full` | 9999px | **Apenas** Chips e Tags |

**Regra:** Nunca use `full` em botões, cards ou inputs. Muito `pill` faz o app parecer um port mobile.

---

## 10. Interações

Para parecer um aplicativo Linux nativo (GNOME/Libadwaita):

```css
/* Hover de lista/botão */
transition: background 0.1s ease-in;

/* Click (active state) */
transform: scale(0.98);

/* Transição de tab/página */
transition: opacity 0.15s ease;
```

**Regra:** Hover states devem ser **sutis** — mudança de `surface_container_low` para `surface_container_high` é suficiente. Sem glow, sem shadow extra.

---

## 11. Glassmorphism (uso restrito)

Reservado para painéis flutuantes, timers "always-on-top" ou modais de confirmação.

```css
background: rgba(255, 255, 255, 0.80);   /* surface_container_lowest 80% */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border-radius: 12px;
```

Nunca aplique em elementos estáticos de layout.

---

## 12. Regras de Ouro

### Faça

- Abrace espaço em branco extremo. Se uma seção parece "vazia", provavelmente está funcionando.
- Use `Manrope` para números em visualizações de dados — dá peso editorial.
- Alterne fundo de linhas para criar separação sem divisores.
- Use cores de projeto como único elemento vibrante na tela.
- Mantenha consistência estrita com os tokens de superfície.

### Não faça

- **Não** use `#000000` em sombras ou texto. Use `on_surface` (#2a3439).
- **Não** use `border-radius: full` em botões ou cards.
- **Não** use `1px solid border` para definir containers ou seções.
- **Não** use a paleta de marca (primary/tertiary) como cor de projeto.
- **Não** adicione sombras em elementos estáticos.
- **Não** use amarelo puro como cor de atenção — use `warning_surface` (#c6d7e1).

---

## 13. Variáveis CSS (referência rápida)

```css
:root {
  /* Surfaces */
  --surface:                  #f8f9fb;
  --surface-container-low:    #f0f4f7;
  --surface-container:        #e8eff3;
  --surface-container-high:   #dde6eb;
  --surface-container-highest:#d4dee4;
  --surface-container-lowest: #ffffff;
  --surface-variant:          #dde6eb;
  --outline-variant:          #a9b4b9;

  /* Brand */
  --primary:          #506169;
  --primary-dim:      #45555d;
  --primary-fixed:    #cde7f4;
  --primary-fixed-dim:#c6d7e1;
  --primary-fixed-var:#8fa5ae;
  --on-primary:       #ffffff;

  /* Status */
  --tertiary:         #006b5f;
  --error:            #9f403d;
  --warning-surface:  #c6d7e1;
  --warning-text:     #7a6020;

  /* Text */
  --on-surface:         #2a3439;
  --on-surface-variant: #506169;
  --on-surface-muted:   #8fa5ae;

  /* Typography */
  --font-display: 'Manrope', sans-serif;
  --font-body:    'Inter', sans-serif;

  /* Gradient */
  --gradient-primary: linear-gradient(135deg, #506169 0%, #45555d 100%);

  /* Radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-float: 0 8px 32px rgba(42, 52, 57, 0.08);
}
```

---

*WorkCycle Design System — versão 1.0 · The Curated Workspace*
