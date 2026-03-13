#!/bin/sh
set -e

echo "========================================="
echo "  DVB CMS - Starting Application"
echo "========================================="

# Wait for database to be ready
echo "Waiting for database..."
until nc -z ${DB_HOST:-db} ${DB_PORT:-5432} 2>/dev/null; do
  echo "  Database not ready, retrying in 2s..."
  sleep 2
done
echo "Database is ready!"

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss
echo "Migrations complete."

# Seed database if first run
if [ "${SEED_DATABASE}" = "true" ]; then
  echo "Seeding database with initial data..."
  npx prisma db seed || echo "Seeding skipped (may already be seeded)."
fi

echo "========================================="
echo "  DVB CMS is starting on port 3000"
echo "========================================="

# Execute the main command
exec "$@"
