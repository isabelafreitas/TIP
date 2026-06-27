CREATE TABLE IF NOT EXISTS non_attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  recorded_at TIMESTAMP DEFAULT NOW()
);
