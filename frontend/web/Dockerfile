# syntax=docker/dockerfile:1.8

FROM node:20-alpine AS base
WORKDIR /app/frontend
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

# Install deps for the standalone frontend workspace
COPY frontend/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY frontend/pnpm-lock.yaml ./pnpm-lock.yaml
COPY frontend/web/package.json ./web/package.json
COPY frontend/packages/talvra-ui/package.json ./packages/talvra-ui/package.json
COPY frontend/packages/talvra-hooks/package.json ./packages/talvra-hooks/package.json
COPY frontend/packages/talvra-api/package.json ./packages/talvra-api/package.json
COPY frontend/packages/talvra-routes/package.json ./packages/talvra-routes/package.json
COPY frontend/packages/talvra-constants/package.json ./packages/talvra-constants/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --filter web... --frozen-lockfile=false

# Build web
FROM base AS build
WORKDIR /app/frontend
COPY frontend/ ./
RUN pnpm -C web build

# Nginx to serve static
FROM nginx:1.27-alpine AS runner
COPY --from=build /app/frontend/web/dist /usr/share/nginx/html
COPY frontend/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]

