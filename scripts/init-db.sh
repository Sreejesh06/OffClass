#!/bin/bash
set -e

# Wait for postgres to be ready
until pg_isready -U "$POSTGRES_USER"; do
  echo "Waiting for postgres..."
  sleep 2
done

# Create the least-privilege cryptid_app user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER cryptid_app WITH PASSWORD '${APP_DB_PASSWORD:-app_password}';
    GRANT CONNECT ON DATABASE $POSTGRES_DB TO cryptid_app;
    GRANT USAGE ON SCHEMA public TO cryptid_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cryptid_app;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO cryptid_app;
EOSQL
