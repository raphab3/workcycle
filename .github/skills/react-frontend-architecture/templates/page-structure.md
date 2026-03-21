# Page structure template

```text
src/
  pages/
    <PageName>Page/
      index.tsx
      styles.ts
```

Page rules:

- The page composes module components and route-level layout only.
- Do not place heavy business logic, fetch orchestration, or domain state mutations directly in the page.
- If route params are needed, read them in the page and pass the minimum necessary data into module hooks or components.