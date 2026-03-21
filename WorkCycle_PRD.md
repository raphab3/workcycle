# WorkCycle — MVP

> **PWA web com infra Docker.** Gestão de tempo proporcional por ciclo com equilíbrio semanal, projetos fixos, carga de tarefas e sugestão automática de alocação.

---

## A Dor

Você tem 8 projetos. Hoje tem 10h disponíveis. Não dá para trabalhar em todos com qualidade. Quais projetos entram no dia? Quanto tempo cada um recebe? E no fim da semana, algum projeto foi negligenciado? E aquele projeto com sprint encerrando amanhã — ele recebeu atenção suficiente?

Hoje essa decisão é feita na intuição. O WorkCycle MVP resolve isso: você informa quantas horas tem disponíveis, o sistema monta a escala do dia considerando o déficit da semana e a carga de tarefas de cada projeto, e garante que ao longo da semana cada projeto receba o que lhe é devido.

---

## Premissas do MVP

- Um **ciclo = um dia de trabalho**
- Você cadastra manualmente as horas disponíveis ao abrir o app
- Uma semana tem de **6 a 7 ciclos possíveis** (seg–sáb obrigatório, dom opcional)
- Nem todos os projetos aparecem em todos os dias — o sistema **seleciona e distribui** com base no déficit semanal e na carga de tarefas
- Projetos podem ser **fixos** (aparecem sempre nos dias configurados, com tempo reservado) ou **rotativos** (entram conforme o déficit)
- O desenvolvedor controla **quantos projetos quer por ciclo**, respeitando o mínimo matemático
- Tasks existem para **informar a alocação** e dar visibilidade de prazos — não substituem o board externo (Jira, Trello, Linear)

---

## Stack

### Visão Geral

```
Frontend    Next.js 14 (App Router) — PWA
Backend     Next.js API Routes (full-stack no mesmo projeto)
Banco       PostgreSQL 16
ORM         Prisma
Infra       Docker Compose
```

### Por que essa escolha

O mock de validação foi construído em React. O Next.js aproveita esse código diretamente — nenhuma reescrita de componentes ou lógica de algoritmo. A decisão de manter tudo no mesmo projeto (frontend + API routes) reduz fricção de deploy e configuração para o MVP.

O PostgreSQL substitui o SQLite original pela capacidade de queries de agregação semanal com window functions e views materializadas — essencial para o cálculo de déficit acumulado. Rodando em Docker, o ambiente é idêntico em dev e produção.

A aplicação roda como **PWA** — instalável via browser no Linux, sem necessidade de `.deb`, `.AppImage` ou qualquer gerenciador de pacotes. Funciona como app nativo no dock com acesso via `localhost`.

### Estrutura de Pastas

```
workcycle/
├── app/
│   ├── (pages)/
│   │   ├── hoje/page.tsx
│   │   ├── semana/page.tsx
│   │   ├── tarefas/page.tsx
│   │   └── projetos/page.tsx
│   ├── api/
│   │   ├── projects/route.ts
│   │   ├── cycles/route.ts
│   │   ├── allocations/route.ts
│   │   └── tasks/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/              ← primitivos do design system
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Chip.tsx
│   │   ├── Bar.tsx
│   │   ├── Stepper.tsx
│   │   └── MetaLabel.tsx
│   ├── hoje/
│   ├── semana/
│   ├── tarefas/
│   └── projetos/
├── lib/
│   ├── prisma.ts        ← singleton do PrismaClient
│   ├── algorithm.ts     ← lógica de score e geração de escala
│   └── helpers.ts       ← fmtH, daysUntil, devStatus
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── manifest.json    ← PWA manifest
├── docker-compose.yml
├── Dockerfile
└── docs/
    ├── MVP_PRD.md       ← este arquivo
    └── DESIGN_SYSTEM.md
```

### Docker Compose

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://workcycle:workcycle@db:5432/workcycle
      NODE_ENV: production

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: workcycle
      POSTGRES_USER: workcycle
      POSTGRES_PASSWORD: workcycle
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U workcycle"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### PWA — manifest.json

```json
{
  "name": "WorkCycle",
  "short_name": "WorkCycle",
  "description": "Gestão de tempo proporcional por ciclos",
  "start_url": "/hoje",
  "display": "standalone",
  "background_color": "#f8f9fb",
  "theme_color": "#506169",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Design System

O sistema visual segue o guia **DESIGN_SYSTEM.md** (The Curated Workspace). Resumo dos princípios aplicados no MVP:

### Identidade Visual

**Architectural Editor** — interface construída como editorial de alto padrão. As cores dos projetos são os únicos elementos vibrantes. Tudo mais recede em tons de slate frios.

### Fontes

```
Manrope  → números em destaque, títulos de página, headlines
Inter    → corpo, labels, tabelas, formulários
```

Importar via `next/font/google` para performance otimizada.

### Paleta Principal

| Token | Hex | Uso |
|---|---|---|
| `surface` | `#f8f9fb` | Background base |
| `surface_container_low` | `#f0f4f7` | Linhas alternadas, áreas secundárias |
| `surface_container` | `#e8eff3` | Topbar, nav |
| `surface_container_lowest` | `#ffffff` | Cards — efeito levantado |
| `primary` | `#506169` | Ações, foco, gradiente |
| `primary_dim` | `#45555d` | Fim do gradiente |
| `tertiary` | `#006b5f` | Equilibrado ✓ |
| `error` | `#9f403d` | Crítico ● · Atrasado |
| `on_surface` | `#2a3439` | Texto principal |
| `on_surface_muted` | `#8fa5ae` | Metadata, placeholders |

### Regras Fundamentais

- **Sem bordas `1px solid`** para definir containers — usar transições tonais
- **Sem divisores** entre itens de lista — usar alternância de fundo
- Botão primário com **gradiente 135°** de `primary` → `primary_dim`
- Barra de progresso com **trilha de 8px** em `surface_variant`
- Inputs com estilo **soft-well** — `border-bottom` de 2px no foco, sem caixa
- `border-radius: 9999px` **apenas** em Chips e Tags
- Sombras apenas em **estados flutuantes** — nunca em estáticos

Para o guia completo de componentes, tokens e regras: ver `docs/DESIGN_SYSTEM.md`.

---

## Schema Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id               Int      @id @default(autoincrement())
  name             String
  colorHex         String
  allocationPct    Float
  isActive         Boolean  @default(true)
  isFixed          Boolean  @default(false)
  fixedDays        String[] // ["Seg", "Ter", "Qua", "Qui", "Sex"]
  fixedHoursPerDay Float    @default(0)
  sprintDays       Int      @default(14)  // 7 | 14 | 30
  sprintStart      DateTime?
  createdAt        DateTime @default(now())

  allocations CycleAllocation[]
  tasks       Task[]
}

model Cycle {
  id               Int      @id @default(autoincrement())
  date             DateTime @unique
  availableHours   Float
  projectsPerCycle Int
  status           CycleStatus @default(PLANNED)
  createdAt        DateTime    @default(now())

  allocations CycleAllocation[]
}

enum CycleStatus {
  PLANNED
  ACTIVE
  COMPLETED
  SKIPPED
}

model CycleAllocation {
  id           Int     @id @default(autoincrement())
  cycleId      Int
  projectId    Int
  isFixed      Boolean @default(false)
  plannedHours Float
  actualHours  Float?
  wasAdjusted  Boolean @default(false)

  cycle   Cycle   @relation(fields: [cycleId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id])

  @@unique([cycleId, projectId])
}

model Task {
  id        Int          @id @default(autoincrement())
  projectId Int
  title     String
  priority  TaskPriority @default(MEDIUM)
  status    TaskStatus   @default(TODO)
  dueDate   DateTime?
  createdAt DateTime     @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

enum TaskPriority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum TaskStatus {
  TODO
  DOING
  DONE
}
```

### View de Equilíbrio Semanal

Criada via migration SQL raw — aproveita window functions do Postgres:

```sql
CREATE VIEW weekly_balance AS
SELECT
  p.id,
  p.name,
  p.color_hex,
  p.allocation_pct,
  COALESCE(SUM(ca.actual_hours), 0) AS actual_hours,
  ROUND(
    COALESCE(SUM(ca.actual_hours), 0) * 100.0
    / NULLIF(SUM(SUM(ca.actual_hours)) OVER (), 0), 1
  ) AS actual_pct,
  ROUND(
    (p.allocation_pct - ROUND(
      COALESCE(SUM(ca.actual_hours), 0) * 100.0
      / NULLIF(SUM(SUM(ca.actual_hours)) OVER (), 0), 1
    )), 1
  ) AS deviation_pct
FROM projects p
LEFT JOIN cycle_allocations ca ON ca.project_id = p.id
LEFT JOIN cycles c ON c.id = ca.cycle_id
  AND c.date >= date_trunc('week', CURRENT_DATE)
  AND c.date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
WHERE p.is_active = true
GROUP BY p.id, p.name, p.color_hex, p.allocation_pct;
```

---

## Módulos do MVP

---

### 1. Projetos

Cada projeto representa um cliente, contrato ou frente de trabalho.

**Cadastro:**
- Nome e cor de identificação (paleta de 10 cores de projeto — ver Design System)
- Percentual de alocação (% do tempo total que este projeto deve receber)
- Tipo: **fixo** ou **rotativo**
- Sprint: duração em dias (7, 14 ou 30) e data de início
- Status: ativo ou pausado

**Percentual de alocação:**
A soma dos projetos ativos deve totalizar 100%. O sistema valida em tempo real e bloqueia a geração do ciclo enquanto a soma estiver incorreta. Projetos pausados são excluídos temporariamente sem perder o percentual — os demais são normalizados automaticamente.

**Exemplo com 8 projetos:**
| Projeto | Alocação | Tipo | Sprint |
|---|---|---|---|
| ClienteCore | 25% | Fixo (Seg–Sex, 2h/dia) | 14 dias |
| FinTrack | 20% | Rotativo | 7 dias |
| MediSync | 15% | Rotativo | 14 dias |
| LogiFlow | 12% | Rotativo | 30 dias |
| DataVault | 10% | Rotativo | 7 dias |
| ShopEngine | 8% | Rotativo | 14 dias |
| AuthGuard | 6% | Rotativo | 30 dias |
| ReportPilot | 4% | Rotativo | 7 dias |

---

### 2. Projetos Fixos

Projetos com contrato de presença diária — aqueles que têm daily, reuniões recorrentes ou obrigação contratual.

**Configuração:**
- Dias da semana em que o projeto é fixo (ex: Seg–Sex; no Sáb não aparece)
- Horas reservadas por dia (ex: 2h para daily + desenvolvimento mínimo)

**Comportamento no ciclo:**
- Entram automaticamente na escala do dia, sem disputar slots com os rotativos
- O tempo reservado é descontado antes da distribuição dos rotativos
- Não possuem stepper de ajuste na escala — o tempo é fixo pelo contrato

```
Disponível hoje:         10h
ClienteCore fixo (2h):  − 2h
Restante para rotativos: 8h → distribuídos proporcionalmente
```

---

### 3. Projetos por Ciclo

O desenvolvedor define quantos projetos quer no ciclo. O sistema impõe um mínimo matemático.

**Regra do mínimo:**
```
mínimo por ciclo = ⌈total de projetos ativos ÷ ciclos da semana⌉
```

Com 8 projetos e 6 ciclos → mínimo 2 por ciclo. Definir apenas 1 tornaria impossível cobrir todos os projetos na semana.

---

### 4. Tarefas

Tasks cadastradas por projeto informam o algoritmo e dão visibilidade de prazos. Não substituem boards externos.

**Campos:**
- Título, prioridade (crítica/alta/média/baixa), status (a fazer/em andamento/concluída), data limite

**Sprint por projeto:**
Cada projeto tem uma sprint configurada (7, 14 ou 30 dias) que define o horizonte de referência para prazos e cálculo de carga.

**O que as tasks NÃO fazem no MVP:**
- Não são distribuídas automaticamente entre ciclos
- Não bloqueiam ou condicionam a geração da escala
- Não substituem o board externo

---

### 5. Ciclo do Dia

A única ação diária do usuário.

**Campos:**
- Data (preenchida automaticamente, editável)
- Horas disponíveis
- Projetos por ciclo (entre o mínimo e o total ativo)

**Geração da escala — algoritmo:**

1. Reserva o tempo dos projetos fixos do dia
2. Calcula o score de cada rotativo:

```
score = 0.6 × (déficit_horas / horas_disponíveis)
      + 0.4 × (carga_tasks / carga_máxima_do_pool)

carga_tasks = Σ (peso_prioridade × urgência_prazo)
  crítica = 8pts · alta = 4pts · média = 2pts · baixa = 1pt
  urgência: hoje = ×3 · ≤3 dias = ×2 · ≤7 dias = ×1.3 · resto = ×1
```

3. Seleciona os N rotativos com maior score
4. Distribui o tempo restante proporcionalmente entre eles

**Exemplo:**
```
10h disponíveis · 4 projetos · ClienteCore fixo

ClienteCore  → 2h00  (fixo reservado)
DataVault    → 2h40  (migration crítica vencendo hoje)
FinTrack     → 2h10  (sprint encerrando + déficit)
MediSync     → 1h40  (déficit moderado)
AuthGuard    → 1h30  (tempo restante)
```

---

### 6. Sugestão de Redistribuição de Percentual

Banner colapsável na tela Hoje que compara o percentual atual de cada projeto com o percentual sugerido pela carga de tasks.

**Lógica:**
- Proporção da carga total de tasks por projeto → percentual sugerido
- Exibe delta entre atual e sugerido
- Apenas informativo — o desenvolvedor decide se aplica

**Exemplo:**
```
Projeto      Atual   Sugerido   Δ
DataVault    10%     18%        +8%  ← sprint cheia, task crítica
FinTrack     20%     22%        +2%
ReportPilot   4%      1%        −3%  ← sprint quase vazia
```

---

### 7. Registro de Tempo

Manual ao encerrar o ciclo. Stepper de ±15min por projeto.

Sem timer automático no MVP. Os dados alimentam o cálculo de déficit dos próximos ciclos.

---

### 8. Avaliação Semanal

Semana de segunda a sábado (6 ciclos). Domingo opcional.

**Desvio por projeto:**
| Indicador | Critério | Cor |
|---|---|---|
| ✓ Equilibrado | Desvio ≤ ±10% | `tertiary` #006b5f |
| ⚠ Atenção | Desvio 10–20% | `warning_text` #7a6020 |
| ● Crítico | Desvio > 20% | `error` #9f403d |

O desvio semanal alimenta o score dos próximos ciclos — projetos com maior déficit sobem no ranking.

---

## Fluxo de Uso Diário

```
1. Abre o app (PWA no browser ou dock)
         ↓
2. Vê sugestão de redistribuição de % (baseada nas tasks)
         ↓
3. Informa horas disponíveis + projetos por ciclo
         ↓
4. Recebe a escala gerada (fixos + rotativos por score)
         ↓
5. Consulta tasks de cada bloco se necessário
         ↓
6. Trabalha seguindo a escala
         ↓
7. Ao encerrar: registra horas reais por projeto
         ↓
8. Sistema atualiza o equilíbrio semanal no Postgres
```

---

## Telas do MVP

| Tela | Rota | Função |
|---|---|---|
| **Hoje** | `/hoje` | Configurar ciclo, ver sugestão de %, receber escala, encerrar e registrar |
| **Semana** | `/semana` | Tabela horas por projeto × dia, desvios acumulados |
| **Tarefas** | `/tarefas` | CRUD de tasks por projeto com prioridade, prazo e status |
| **Projetos** | `/projetos` | Cadastro, percentuais, tipo fixo/rotativo, sprint, carga de tasks |

---

## API Routes

```
GET  /api/projects              → lista projetos ativos
POST /api/projects              → criar projeto
PUT  /api/projects/[id]         → editar projeto
DEL  /api/projects/[id]         → pausar/arquivar

GET  /api/cycles/today          → ciclo do dia (se existir)
POST /api/cycles                → criar ciclo + gerar escala
PUT  /api/cycles/[id]/close     → encerrar ciclo com horas reais

GET  /api/cycles/week           → ciclos + alocações da semana atual
GET  /api/cycles/week/balance   → query weekly_balance view

GET  /api/tasks?projectId=      → tasks por projeto
POST /api/tasks                 → criar task
PUT  /api/tasks/[id]            → atualizar status / campos
DEL  /api/tasks/[id]            → remover task
```

---

## O que fica fora do MVP

| Feature | Versão |
|---|---|
| Timer automático de sessões | v2 |
| Registro de reuniões com desconto do ciclo | v2 |
| Registro de interrupções | v2 |
| Nota de retomada por sessão | v2 |
| Avaliação mensal | v2 |
| Exportação / importação (JSON + CSV) | v2 |
| Modo foco (silencia notificações) | v2 |
| Autenticação (multi-usuário) | v2 |
| Distribuição automática de tasks nos ciclos | v3 |
| Previsão de entrega por projeto | v3 |

---

## Critério de Sucesso do MVP

O MVP está funcionando quando o usuário consegue responder, em menos de 30 segundos após abrir o app:

> *"Hoje tenho X horas. Devo dedicar Y ao Projeto A (fixo), Z ao Projeto B (sprint vencendo amanhã) e W ao Projeto C (maior déficit da semana) — porque o sistema já calculou isso por mim."*

E ao fim da semana:

> *"O Projeto B recebeu 6h de 8h previstas. O DataVault tem uma task crítica vencendo hoje e precisa entrar amanhã com mais tempo."*

---

## Referências

| Documento | Localização |
|---|---|
| Design System | `docs/DESIGN_SYSTEM.md` |
| Schema Prisma | `prisma/schema.prisma` |
| Algoritmo de score | `lib/algorithm.ts` |

---

*WorkCycle MVP — versão do documento: 4.0*
