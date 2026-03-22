# Backend

Backend foundation for WorkCycle Agenda mode.

## Stack

- Node.js 20
- NestJS
- Fastify adapter
- Drizzle ORM
- PostgreSQL
- TypeScript strict mode

## Scripts

- `npm run dev` starts the NestJS API in watch mode
- `npm run build` compiles TypeScript and rewrites alias imports for runtime
- `npm run start` runs the compiled server
- `npm run lint` runs ESLint
- `npm run db:generate` generates SQL migrations from the Drizzle schema
- `npm run db:migrate` applies generated Drizzle migrations

## Environment

Copy `.env.example` to `.env` when running locally outside Docker.

Required variables:

- `DATABASE_URL`

Optional variables:

- `NODE_ENV`
- `HOST`
- `PORT`
- `FRONTEND_ORIGIN`
- `LOG_LEVEL`

## Health Check

- `GET /api/health`

The endpoint verifies API availability and checks database connectivity through NestJS + Drizzle.