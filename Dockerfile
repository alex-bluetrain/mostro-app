# Build web estático de mostro-app (web.output: "static") y servir con nginx.
# Las EXPO_PUBLIC_* se inyectan en build time (quedan en el bundle).
# Para cambiarlas hay que rebuildear.

FROM node:22-alpine AS build
WORKDIR /app

# Vars publicas de la app, inyectadas en el bundle durante expo export.
ARG EXPO_PUBLIC_MOSTRO_SERVER_URL
ARG EXPO_PUBLIC_GOOGLE_CLIENT_ID
ARG EXPO_PUBLIC_DEV_LOGIN
ENV EXPO_PUBLIC_MOSTRO_SERVER_URL=$EXPO_PUBLIC_MOSTRO_SERVER_URL
ENV EXPO_PUBLIC_GOOGLE_CLIENT_ID=$EXPO_PUBLIC_GOOGLE_CLIENT_ID
ENV EXPO_PUBLIC_DEV_LOGIN=$EXPO_PUBLIC_DEV_LOGIN

RUN corepack enable
ENV PNPM_HOME=/pnpm
RUN pnpm config set store-dir /pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm expo export -p web

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
