#!/bin/sh
# Qrioo Docker Entrypoint
# Handles DB initialization and server startup

set -e

echo "=== Qrioo Starting ==="
echo "DATABASE_URL: ${DATABASE_URL}"

# Ensure data directory exists
mkdir -p /app/data

# Run Prisma schema push (creates/updates tables)
echo "Running database migration..."
bunx prisma db push --accept-data-loss 2>&1
echo "Database migration complete."

# Start the Next.js server
echo "Starting Qrioo server on port ${PORT:-3000}..."
exec bun server.js
