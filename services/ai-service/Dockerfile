# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate && pnpm config set store-dir /app/.pnpm-store

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

COPY services/ai-service/package.json services/ai-service/
RUN pnpm -C services/ai-service install --frozen-lockfile=false

COPY services/ai-service/ services/ai-service/
RUN pnpm -C services/ai-service build

WORKDIR /app/services/ai-service
EXPOSE 4020
CMD ["node", "dist/index.js"]

