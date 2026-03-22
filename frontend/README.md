# WorkCycle Frontend

## Desenvolvimento com Docker

O ambiente de desenvolvimento agora usa bind mount do diretório `frontend/` dentro do container. Isso permite que alterações em `src/`, `public/` e arquivos de configuração reflitam automaticamente no `next dev` sem rebuild da imagem.

### Subir o ambiente

```bash
make up
```

ou

```bash
docker compose up -d
```

### Quando o hot reload deve funcionar

- alterações em arquivos `.ts`, `.tsx`, `.css`, `.md` e assets do frontend;
- mudanças em `src/app`, `src/modules`, `src/shared` e `public`;
- ajustes no backend em `backend/src` também passam a refletir com watch.

### Quando ainda precisa rebuild

Rebuild continua necessário quando você altera dependências ou o ambiente-base do container, por exemplo:

- `package.json`
- `pnpm-lock.yaml`
- `Dockerfile`

Nesse caso, use:

```bash
make rebuild-frontend
```

ou, para o backend:

```bash
make rebuild-backend
```

### Observações

- O Compose mantém `node_modules` e `.next` em volumes nomeados para evitar conflito com dependências locais.
- Foram habilitados `WATCHPACK_POLLING` e `CHOKIDAR_USEPOLLING` para tornar a detecção de mudanças mais consistente dentro do container.
- Os containers passaram a usar Node 24 para alinhar com a versão exigida no projeto.
