# syntax=docker/dockerfile:1.8

FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

FROM base AS deps
COPY services/api-gateway/package.json services/api-gateway/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm -C services/api-gateway install --frozen-lockfile=false

FROM deps AS build
COPY services/api-gateway/ services/api-gateway/
WORKDIR /app/services/api-gateway
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/services/api-gateway/dist ./dist
COPY services/api-gateway/package.json ./package.json
RUN npm pkg set scripts.start="node dist/index.js"

EXPOSE 3001
CMD ["node", "dist/index.js"]

