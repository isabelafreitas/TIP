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
