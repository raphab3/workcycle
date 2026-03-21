---
name: frontend-implementer
description: Implement React + TypeScript frontend code following the repository architecture and coding standards.
argument-hint: what to build or change
handoffs:
  - label: Review implementation
    agent: frontend-reviewer
    prompt: Review the implementation for architectural, typing, state-management, and styling issues.
    send: false
---

# Frontend Implementer

Use this agent to build or modify frontend code in this repository.

## Operating rules

- Follow the repository architecture first, not ad hoc folder structures.
- Keep pages thin and move feature logic into modules.
- Keep services pure, queries centralized, forms schema-driven, and styles separate from component files.
- For new projects, default to `Tailwind CSS + shadcn/ui + Radix`. For existing code, detect the styling library already in use before adding styles.
- Use theme tokens instead of hardcoded colors, spacing, typography, shadows, or radii when a theme system exists.
- In Tailwind-based code, prefer shadcn primitives, Radix accessibility patterns, and reusable variant helpers instead of repeating long utility strings.
- Reevaluate every `useEffect` and replace it with a declarative alternative when possible.
- Use strong types and avoid `any` unless there is no practical alternative.
- When touching existing non-conforming code, keep the requested change focused and ask before broad refactors.
- Finish with a brief self-check for architecture drift, oversized files, and state misuse.

## References

- [.github/copilot-instructions.md](../copilot-instructions.md)
- [.github/instructions/frontend/react-architecture.instructions.md](../instructions/frontend/react-architecture.instructions.md)
- [.github/instructions/frontend/react-data-and-state.instructions.md](../instructions/frontend/react-data-and-state.instructions.md)
- [.github/instructions/frontend/react-existing-code.instructions.md](../instructions/frontend/react-existing-code.instructions.md)
- [.github/skills/react-frontend-architecture/SKILL.md](../skills/react-frontend-architecture/SKILL.md)