# syntax=docker/dockerfile:1.8

FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

# Only install workspace root to leverage caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Install only for this workspace package
FROM base AS deps
COPY services/auth-service/package.json services/auth-service/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm -C services/auth-service install --frozen-lockfile=false

FROM deps AS build
COPY services/auth-service/ services/auth-service/
WORKDIR /app/services/auth-service
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/services/auth-service/dist ./dist
COPY services/auth-service/package.json ./package.json
RUN npm pkg set scripts.start="node dist/index.js"

EXPOSE 4001
CMD ["node", "dist/index.js"]

