CREATE TABLE IF NOT EXISTS announcement_candidacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id),
  provider_id UUID REFERENCES users(id),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(announcement_id, provider_id)
);
