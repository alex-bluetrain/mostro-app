# Static web build of mostro-app (web.output: "static") served by nginx.
# Server URL and Google client ID are read at runtime from /config.js, which
# is copied from public/config.js (required; see docs/docker-web-runtime-config.md).
# Override it without rebuilding by mounting a file over it.

FROM node:22-alpine AS build
WORKDIR /app

# The only build-time var the web bundle reads: "1" enables API-key login.
ARG EXPO_PUBLIC_DEV_LOGIN
ENV EXPO_PUBLIC_DEV_LOGIN=$EXPO_PUBLIC_DEV_LOGIN

RUN corepack enable
ENV PNPM_HOME=/pnpm
RUN pnpm config set store-dir /pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN test -f public/config.js || (echo 'public/config.js missing: copy public/config.js.example' >&2; exit 1)
RUN pnpm expo export -p web

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
