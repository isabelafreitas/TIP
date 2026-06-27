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
