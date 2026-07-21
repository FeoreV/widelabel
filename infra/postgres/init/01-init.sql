-- Database initialization script for local environment
SELECT 'CREATE DATABASE medusa_store'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'medusa_store');
