# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate && pnpm config set store-dir /app/.pnpm-store

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

COPY services/api-gateway/package.json services/api-gateway/
RUN pnpm -C services/api-gateway install --frozen-lockfile=false

COPY services/api-gateway/ services/api-gateway/
RUN pnpm -C services/api-gateway build

WORKDIR /app/services/api-gateway
EXPOSE 3001
CMD ["node", "dist/index.js"]
