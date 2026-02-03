#!/bin/sh
set -e

echo "Waiting for database and applying migrations..."
RETRY=0
MAX_RETRIES=60
until npx sequelize-cli db:migrate --url "mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"; do
  RETRY=$((RETRY+1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "Migrations failed after ${MAX_RETRIES} attempts" >&2
    exit 1
  fi
  echo "DB not ready yet (attempt ${RETRY}/${MAX_RETRIES}), sleeping 2s..."
  sleep 2
done

echo "Migrations applied. Starting app..."
exec npm run dev
