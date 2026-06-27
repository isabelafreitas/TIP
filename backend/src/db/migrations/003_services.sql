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
