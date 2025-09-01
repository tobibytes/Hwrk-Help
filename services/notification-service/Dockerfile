# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate && pnpm config set store-dir /app/.pnpm-store

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

COPY services/notification-service/package.json services/notification-service/
RUN pnpm -C services/notification-service install --frozen-lockfile=false

COPY services/notification-service/ services/notification-service/
RUN pnpm -C services/notification-service build

WORKDIR /app/services/notification-service
EXPOSE 4040
CMD ["node", "dist/index.js"]

