# Existing code checklist

Use this checklist before changing established frontend code.

1. Identify the framework and router already in use.
2. Identify the styling approach already in use in the target module.
3. Check whether the page contains business logic that should stay in a module.
4. Check whether services and queries are separated.
5. Check whether forms use React Hook Form and Zod or a different established pattern.
6. Check for `useEffect` that should become React Query, derived state, or event-driven logic.
7. Check for oversized components, files, or style files.
8. Check for `any`, inline domain types, missing DTOs, or weak prop typing.
9. Decide whether the requested change can be done safely without refactoring.
10. If broader refactoring would help, ask the user before doing it.