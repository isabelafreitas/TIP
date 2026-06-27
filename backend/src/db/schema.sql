-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
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

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id),
  description TEXT NOT NULL,
  tags TEXT[],
  expected_price DECIMAL(10,2),
  expires_at TIMESTAMP NOT NULL,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active','closed','expired')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES users(id),
  announcement_id UUID REFERENCES announcements(id),
  description TEXT NOT NULL,
  category VARCHAR NOT NULL,
  scheduled_date DATE,
  scheduled_period VARCHAR CHECK (scheduled_period IN ('morning','afternoon','evening')),
  suggested_price DECIMAL(10,2),
  agreed_price DECIMAL(10,2),
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending','accepted','scheduled','in_progress','completed_by_provider','confirmed','disputed','cancelled','closed')),
  cancelled_by VARCHAR CHECK (cancelled_by IN ('requester','provider')),
  cancellation_reason VARCHAR,
  modification_count INTEGER DEFAULT 0,
  payment_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Announcement candidacies
CREATE TABLE IF NOT EXISTS announcement_candidacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id),
  provider_id UUID REFERENCES users(id),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(announcement_id, provider_id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id),
  pagarme_transaction_id VARCHAR,
  amount_service DECIMAL(10,2) NOT NULL,
  amount_fee DECIMAL(10,2) NOT NULL,
  amount_total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR CHECK (payment_method IN ('credit_once','credit_2x','debit','pix')),
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending','held','released','refunded','partially_refunded')),
  held_at TIMESTAMP,
  released_at TIMESTAMP,
  auto_release_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id),
  reviewer_id UUID REFERENCES users(id),
  reviewee_id UUID REFERENCES users(id),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  punctuality SMALLINT CHECK (punctuality BETWEEN 1 AND 5),
  quality SMALLINT CHECK (quality BETWEEN 1 AND 5),
  communication SMALLINT CHECK (communication BETWEEN 1 AND 5),
  comment VARCHAR(300),
  is_visible BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(service_id, reviewer_id)
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID UNIQUE REFERENCES services(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id),
  sender_id UUID REFERENCES users(id),
  type VARCHAR DEFAULT 'text' CHECK (type IN ('text','service_modification_card','system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service modifications
CREATE TABLE IF NOT EXISTS service_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id),
  requested_by UUID REFERENCES users(id),
  new_date DATE,
  new_period VARCHAR,
  reason TEXT,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Saved providers
CREATE TABLE IF NOT EXISTS saved_providers (
  user_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES users(id),
  saved_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(user_id, provider_id)
);

-- Non attendance records
CREATE TABLE IF NOT EXISTS non_attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id),
  opened_by UUID REFERENCES users(id),
  description TEXT NOT NULL,
  photo_urls TEXT[],
  response_description TEXT,
  response_photo_urls TEXT[],
  status VARCHAR DEFAULT 'open' CHECK (status IN ('open','responded','resolved')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key for payment_id in services (after payments table created)
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_payment_id_fkey;
ALTER TABLE services ADD CONSTRAINT services_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id);
