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

## Docker Compose

When the backend service starts through Docker Compose, it automatically applies Drizzle migrations before starting the NestJS dev server.

## Environment

Copy `.env.example` to `.env` when running locally outside Docker.

Required variables:

- `DATABASE_URL`

Optional variables:

- `NODE_ENV`
- `HOST`
- `PORT`
- `FRONTEND_ORIGIN`
- `AUTH_TOKEN_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_SERVICE_ACCOUNT_PATH`
- `LOG_LEVEL`

Firebase Admin can be configured in one of two ways:

- set `FIREBASE_SERVICE_ACCOUNT_JSON` with the full service-account JSON string
- set `FIREBASE_SERVICE_ACCOUNT_PATH` or the `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` trio

## Health Check

- `GET /api/health`

The endpoint verifies API availability and checks database connectivity through NestJS + Drizzle.