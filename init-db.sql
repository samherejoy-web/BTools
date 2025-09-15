-- MarketMind AI Database Initialization Script
-- This script is run when the PostgreSQL container starts for the first time

-- Create database (if not exists)
SELECT 'CREATE DATABASE marketmind_prod'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'marketmind_prod');

-- Create user (if not exists) 
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'marketmind') THEN

      CREATE ROLE marketmind LOGIN PASSWORD 'secure_password_change_me';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE marketmind_prod TO marketmind;

-- Connect to the marketmind_prod database
\c marketmind_prod

-- Grant privileges on schema
GRANT ALL ON SCHEMA public TO marketmind;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO marketmind;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO marketmind;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO marketmind;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO marketmind;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log completion
SELECT 'Database initialization completed successfully' AS status;