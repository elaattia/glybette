FROM node:22-alpine AS base
RUN corepack enable pnpm
ENV NODE_OPTIONS="--dns-result-order=ipv4first"
WORKDIR /app

FROM base AS builder
ARG VITE_PORTFOLIO_ROOT_DOMAIN=glybette.com
ARG VITE_API_BASE_URL=
ENV VITE_PORTFOLIO_ROOT_DOMAIN=${VITE_PORTFOLIO_ROOT_DOMAIN}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm config set registry https://registry.npmjs.org/ && \
    pnpm install --frozen-lockfile && \
    pnpm run --filter "@glybette/client..." build

FROM nginx:alpine AS runner
RUN apk add --no-cache wget
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
EXPOSE 80
