# Reusable Dockerfile for monorepo apps.
FROM node:22-alpine AS base
RUN corepack enable pnpm
ENV NODE_OPTIONS="--dns-result-order=ipv4first"
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm config set registry https://registry.npmjs.org/ && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000 && \
    pnpm install --frozen-lockfile

FROM base AS builder
ARG APP_NAME
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm run --filter "@glybette/${APP_NAME}..." build

FROM base AS runner
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages
COPY --from=deps /app/node_modules ./node_modules
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
USER node
EXPOSE 3000
CMD ["sh", "-c", "node apps/${APP_NAME}/dist/index.js"]