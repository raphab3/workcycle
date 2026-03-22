---
name: Spec-driven planning artifacts
description: "Rules for generating and editing planning artifacts such as epic.md, core-flow.md, and ticket files under docs/planning/. Use when creating specs, decomposition flows, or implementation tickets."
applyTo: "docs/planning/**/*.md"
---

# Spec-driven planning artifacts

- Preserve the three-phase workflow: `EPIC -> CORE FLOW -> TICKETS`.
- Do not create `core-flow.md` before `epic.md` is approved.
- Do not create tickets before `core-flow.md` is approved.
- Keep planning artifacts implementation-ready, with explicit scope, dependencies, acceptance criteria, and open questions.
- Detect and record the actual stack from the repository before making technical recommendations.
- Prefer concrete module, API, data, and integration boundaries over generic prose.
- Include edge cases, recovery paths, and operational risks instead of describing only the happy path.
- For ticket files, keep one clear unit of work per file and ensure acceptance criteria are objectively testable.
- Follow the planning structure under `docs/planning/[epic-slug]/` with `epic.md`, `core-flow.md`, and `tickets/`.
- If information is still ambiguous, leave explicit open questions instead of inventing details.