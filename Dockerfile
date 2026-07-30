# ============================================
# Qrioo - Production Dockerfile for Coolify
# ============================================

# Stage 1: Build
FROM oven/bun:1 AS builder
WORKDIR /app

# Install ALL dependencies for build
COPY package.json bun.lockb* ./
RUN bun install || true

# Generate Prisma client
COPY prisma ./prisma/
RUN bunx prisma generate

# Copy source and build
COPY . .
RUN bun run build

# Stage 2: Production
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install production dependencies (needed for serverExternalPackages like Prisma)
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production || bun install --production

# Generate Prisma client in production
COPY prisma ./prisma/
RUN bunx prisma generate

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy entrypoint
COPY --from=builder docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Data volume for SQLite persistence
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data /app/node_modules/.prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]