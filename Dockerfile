FROM node:20-alpine AS base

# Install sqlite3 and bun
RUN apk add --no-cache sqlite-libs git
RUN npm install -g bun

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Generate Prisma client
COPY prisma ./prisma/
RUN bunx prisma generate

# Copy source
COPY . .

# Build Next.js
RUN bun run build

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment variables
ENV DATABASE_URL=file:/app/data/qrioo.db
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Run db push + start server
CMD ["sh", "-c", "bunx prisma db push --accept-data-loss 2>/dev/null; bun run start"]