
# ===============================
# 1. Builder Stage
# ===============================
FROM node:lts-alpine3.23 AS builder
WORKDIR /app

ENV CI=true
ENV PNPM_CONF_CONFIRM_MODULES_PURGE=false

RUN npm install -g pnpm@12

# ===============================
# Workspace manifests
# ===============================
COPY pnpm-workspace.yaml ./

COPY shared/package.json shared/pnpm-lock.yaml ./shared/
COPY admin/package.json admin/pnpm-lock.yaml ./admin/

# ===============================
# Install workspace dependencies
# ===============================
RUN pnpm install

# ===============================
# Build shared package
# ===============================
COPY shared ./shared

RUN pnpm --filter @headdeck/shared build

# ===============================
# Build Admin
# ===============================
COPY admin ./admin

RUN rm -rf admin/.next
RUN pnpm --filter @headdeck/admin build

# ===============================
# 2. Runner Stage
# ===============================
FROM node:lts-alpine3.23 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

COPY --from=builder /app/admin/public ./admin/public
COPY --from=builder /app/admin/.next/static ./admin/.next/static
COPY --from=builder /app/admin/.next/standalone ./

WORKDIR /app/admin

CMD ["node", "server.js"]