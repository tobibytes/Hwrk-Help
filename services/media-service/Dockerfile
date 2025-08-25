# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate && pnpm config set store-dir /app/.pnpm-store

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

COPY services/media-service/package.json services/media-service/
RUN pnpm -C services/media-service install --frozen-lockfile=false

COPY services/media-service/ services/media-service/
RUN pnpm -C services/media-service build

WORKDIR /app/services/media-service
EXPOSE 4030
CMD ["node", "dist/index.js"]

