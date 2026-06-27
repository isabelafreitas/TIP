CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  photo_url VARCHAR,
  neighborhood VARCHAR,
  bio TEXT,
  is_provider BOOLEAN DEFAULT false,
  provider_profile JSONB,
  rating_avg DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,
  cancellation_count_30d INTEGER DEFAULT 0,
  visibility_reduced_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
