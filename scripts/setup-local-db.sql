CREATE DATABASE calculatoare_online;

\connect calculatoare_online;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Optional:
-- CREATE USER calculatoare_user WITH PASSWORD 'change-me';
-- GRANT ALL PRIVILEGES ON DATABASE calculatoare_online TO calculatoare_user;
