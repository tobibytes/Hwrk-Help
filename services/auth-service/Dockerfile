# syntax=docker/dockerfile:1.8

FROM node:20-alpine
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate && pnpm config set store-dir /app/.pnpm-store

# Workspace manifests
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Service install
COPY services/auth-service/package.json services/auth-service/
RUN pnpm -C services/auth-service install --frozen-lockfile=false

# Copy source and build
COPY services/auth-service/ services/auth-service/
RUN pnpm -C services/auth-service build

WORKDIR /app/services/auth-service
EXPOSE 4001
CMD ["node", "dist/index.js"]
