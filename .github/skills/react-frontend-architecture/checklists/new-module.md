# New module checklist

Use this checklist when creating a new frontend domain such as `customers`, `orders`, or `finances`.

1. Create `src/modules/<domain>/`.
2. Add `components/`, `types/`, `hooks/`, `services/`, and `queries/`.
3. Add `stores/` only if shared business state is required.
4. Add `atoms/` only if small shared UI state is required.
5. Add `types/index.ts` to re-export domain types.
6. Add `queries/keys.ts` for centralized React Query keys.
7. Keep services pure and independent from React.
8. Keep page components under `src/pages/` and let them compose module components only.
9. Add route registration in the active router solution.
10. Keep styles in separate files and source tokens from the theme.
11. Keep file sizes controlled and extract components early.
12. Review all `useEffect` usage before finishing.