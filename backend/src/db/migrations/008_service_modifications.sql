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
