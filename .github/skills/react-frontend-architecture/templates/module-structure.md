# Module structure template

```text
src/
  modules/
    <domain>/
      components/
        <ComponentName>/
          index.tsx
          styles.ts
          types.ts
      types/
        index.ts
        <entity>.ts
      hooks/
        use<Domain><Purpose>.ts
      services/
        <domain>Service.ts
      queries/
        keys.ts
        use<Domain>Query.ts
      stores/
        use<Domain>Store.ts
      atoms/
        <domain>Atoms.ts
      index.ts
```

Notes:

- `stores/` and `atoms/` are optional.
- Add `schema.ts` inside a component folder when the component owns a form.
- Use PascalCase for component folder names and descriptive camelCase for service files.