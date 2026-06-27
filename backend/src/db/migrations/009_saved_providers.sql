CREATE TABLE IF NOT EXISTS saved_providers (
  user_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES users(id),
  saved_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(user_id, provider_id)
);
