# Epic: Integração Backend + Frontend do MVP

> **Status:** Aprovado | **Data:** 2026-03-22 | **Stack detectada:** Monorepo Node 24 com backend NestJS + Fastify + TypeScript + Drizzle + PostgreSQL e frontend Next.js 14 + React 18 + TypeScript + React Query + Axios + Zustand + Jotai + Zod

## Problema

O WorkCycle ainda depende de estado local e fluxos mockados em partes críticas do MVP, o que impede persistência confiável, retomada de sessão após reload, consistência entre dispositivos e validação ponta a ponta do produto.

Este epic existe para consolidar a integração real entre backend e frontend nos domínios de Projects, Tasks, Today, Weekly e Settings, removendo as dependências locais que bloqueiam o uso do MVP com backend como source of truth operacional.

A prioridade não é apenas consumir endpoints existentes, mas redefinir a fronteira de verdade do sistema, especialmente em Tasks e Today, sem regressão visível na experiência principal do produto.

## Usuários

| Perfil | Descrição | Principal necessidade |
|--------|-----------|----------------------|
| Usuário final individual | Pessoa que organiza projetos, tasks, rotina diária e visão semanal no próprio ambiente | Persistência confiável, retomada simples e fluxo diário consistente |

## Visão de Sucesso

- [ ] Projects, Tasks, Today, Weekly e Settings executam seu fluxo principal com backend real, sem depender de mocks locais no caminho principal
- [ ] Sessão diária, tasks, configurações e dados principais sobrevivem a reload e podem ser recuperados de forma consistente
- [ ] Login, navegação principal e comportamento central do MVP continuam funcionando sem regressões visíveis
- [ ] Weekly entrega visão coerente entre semana aberta e histórico fechado, sem conflito lógico com Today e Tasks

## Escopo

### ✅ Dentro do Escopo

- Consolidar Bearer token como contrato oficial de autenticação do MVP integrado
- Adotar política de access token + refresh token
- Revisar foundation de integração para HTTP, tratamento de erro, Axios, React Query e nomenclatura de contratos
- Integrar Projects de ponta a ponta com backend real e remover dependência do fluxo local principal
- Implementar Tasks com persistência completa desde a primeira entrega:
  - CRUD
  - vínculo com projeto
  - checklist
  - persistência real do board
  - vínculo da task com ciclo diário concreto
- Persistir Today com backend como source of truth completo no MVP:
  - sessão diária
  - projeto ativo
  - blocos de tempo
  - pulses
  - regularizações
  - fechamento do dia
  - rollover
- Implementar Weekly com abordagem híbrida:
  - semana aberta com cálculo sob demanda
  - semanas fechadas com persistência e histórico confiável
- Persistir Settings com:
  - timezone
  - notifications enabled
  - daily review time
  - cycle start hour
  - vínculo Google
- Garantir estados de loading, empty, error e success nas telas integradas
- Fechar validação funcional ponta a ponta por domínio

### ❌ Fora do Escopo

- Colaboração multiusuário em tempo real
- Analytics avançado além da visão Weekly base
- Offline-first

## Contexto Técnico

- **Stack:**
  - Backend: NestJS, Fastify, TypeScript, Drizzle, PostgreSQL, Zod, Firebase Admin
  - Frontend: Next.js App Router, React, TypeScript, React Query, Axios, Zustand, Jotai, Zod
- **Integrações:**
  - autenticação com Bearer token
  - fluxo de sessão autenticada
  - vínculo Google em Settings
- **Padrões mandatórios:**
  - frontend: query hook -> service -> axios -> API
  - backend: organização modular por feature com controllers, services, repositories e use-cases
- **Source of truth por domínio:**
  - Projects: backend
  - Tasks: backend
  - Today: backend
  - Weekly: híbrido
  - Settings: backend
- **Dependências estruturais:**
  - Projects antes de Tasks
  - Tasks antes de Weekly
  - Today e Settings compartilham timezone e boundary operacional
  - Weekly depende da definição confiável de Today

## Riscos & Suposições

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Migração de estado local para backend causar regressões de UX | Alto | integração incremental por domínio com cobertura funcional e validação manual |
| Tasks crescer de escopo por incluir checklist, board e vínculo com ciclo diário já no MVP | Alto | explicitar modelo de dados e contrato do domínio antes da implementação |
| Today concentrar demasiada complexidade temporal no MVP | Alto | fechar contrato explícito de sessão, pulse, fechamento e rollover antes do Core Flow |
| Weekly divergir de Today e Tasks por regras diferentes | Alto | usar abordagem híbrida explícita e definir regra de semana aberta vs semana fechada |
| Bearer token com refresh token gerar inconsistência entre frontend e backend | Médio | consolidar política de autenticação na foundation antes da expansão por domínio |
| Settings impactar comportamento operacional por timezone e boundary | Médio | tratar timezone como dependência transversal de Today e Weekly |

## Suposições explícitas

- O MVP é orientado a uso individual, não colaborativo
- Colunas do board de Tasks são fixas e com ordem fixa
- A task se vincula a um ciclo diário concreto no MVP
- Weekly usará abordagem híbrida, e não cálculo puramente local nem snapshot puro para todos os cenários
- O vínculo Google faz parte do escopo inicial de Settings persistido

## Perguntas em Aberto

- [ ] O vínculo Google em Settings inclui apenas visualização e manutenção segura, ou também desvinculação no MVP inicial?
- [ ] Regularizações do Today precisam de trilha auditável mínima ou apenas persistência funcional?
- [ ] A semana fechada do Weekly será persistida como snapshot materializado ou como leitura consolidada persistível em outra forma?
- [ ] Quais mensagens e formato de erro serão padronizados como envelope comum entre backend e frontend?

---
*Gerado por PLANNER — Fase 1/3*