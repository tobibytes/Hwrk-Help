# syntax=docker/dockerfile:1.8

FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

# Install deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY frontend/web/package.json frontend/web/
COPY frontend/packages/talvra-ui/package.json frontend/packages/talvra-ui/
COPY frontend/packages/talvra-hooks/package.json frontend/packages/talvra-hooks/
COPY frontend/packages/talvra-api/package.json frontend/packages/talvra-api/
COPY frontend/packages/talvra-routes/package.json frontend/packages/talvra-routes/
COPY frontend/packages/talvra-constants/package.json frontend/packages/talvra-constants/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --filter web... --frozen-lockfile=false

# Build web
FROM base AS build
COPY frontend/ frontend/
RUN pnpm -C frontend/web build

# Nginx to serve static
FROM nginx:1.27-alpine AS runner
COPY --from=build /app/frontend/web/dist /usr/share/nginx/html
COPY frontend/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]

