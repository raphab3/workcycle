---
name: react-frontend-architecture
description: Create, extend, or review React 18+ and TypeScript frontend code using a modular architecture with pages, modules, shared code, separate style files, React Hook Form, Zod, TanStack React Query, Zustand, Jotai, Axios, and a preferred greenfield UI stack of Tailwind CSS, shadcn/ui, and Radix.
argument-hint: feature, page, module, or project scope to create or review
---

# React Frontend Architecture Skill

Use this skill when the task is to create or maintain React frontend code that should follow the project's modular architecture.

## What this skill enforces

- `pages/` orchestrates route screens and composes module components.
- `modules/` owns domain logic, UI, services, queries, stores, atoms, and domain types.
- `shared/` owns reusable cross-domain components, styles, utils, hooks, stores, and shared types.
- New projects default to `Tailwind CSS + shadcn/ui + Radix` for the UI layer unless the user asks for another stack.
- Styles stay out of `.tsx` component files.
- Theme tokens are the source of truth when styled-components or another theme system is present.
- In Tailwind projects, shared design tokens should live in the Tailwind theme and CSS variables, and reusable primitives should be based on shadcn/ui and Radix.
- Forms use React Hook Form with Zod.
- Server state uses TanStack React Query.
- Shared state choices follow this rule: local state first, Zustand for shared state with actions, Jotai for small reactive UI state.
- `useEffect` is audited aggressively and removed when a more declarative alternative exists.

## Workflow

1. Inspect the repo or target folder before creating files.
2. Detect the existing styling solution and framework conventions.
3. If the task is a new project or greenfield frontend area, default the UI stack to `Tailwind CSS + shadcn/ui + Radix` unless the user requested another one.
4. For new code, create the target page or module using the folder structure in [module structure template](./templates/module-structure.md) and [page structure template](./templates/page-structure.md).
5. Define domain types first, then services, then React Query hooks, then UI components.
6. Put validation in `schema.ts` and infer types from Zod when forms exist.
7. Add Zustand stores or Jotai atoms only when local state or props are no longer sufficient.
8. Keep files focused. If a component grows too much, split it before continuing.
9. Review for hardcoded style values, unnecessary `useEffect`, oversized files, inline styles, and page-level business logic.
10. If changing non-conforming existing code, ask before broad refactors.

## Resource files

- [New module checklist](./checklists/new-module.md)
- [Existing code checklist](./checklists/existing-code.md)
- [Module structure template](./templates/module-structure.md)
- [Page structure template](./templates/page-structure.md)

## Expected output standards

- Strong domain typing with explicit interfaces and DTOs.
- Separate service and query layers.
- Separate style files.
- For greenfield UI work, reusable primitives should come from shadcn/ui and Radix before creating custom low-level components.
- Pages limited to orchestration.
- Minimal, consistent naming and predictable exports.
- No unnecessary effects or duplicated state.