FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json drizzle.config.ts eslint.config.mjs .prettierrc.json .prettierignore ./
COPY src ./src

RUN npm run build

EXPOSE 3333

CMD ["npm", "run", "start"]