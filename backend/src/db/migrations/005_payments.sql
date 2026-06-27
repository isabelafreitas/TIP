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

ALTER TABLE services DROP CONSTRAINT IF EXISTS services_payment_id_fkey;
ALTER TABLE services ADD CONSTRAINT services_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id);
