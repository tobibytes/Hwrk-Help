# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate && pnpm config set store-dir /app/.pnpm-store

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

COPY services/canvas-service/package.json services/canvas-service/
RUN pnpm -C services/canvas-service install --frozen-lockfile=false

COPY services/canvas-service/ services/canvas-service/
RUN pnpm -C services/canvas-service build

WORKDIR /app/services/canvas-service
EXPOSE 4002
CMD ["node", "dist/index.js"]

