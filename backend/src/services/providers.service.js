const { pool } = require('../config/database');

async function listProviders({ category, neighborhood, minRating, page = 1, limit = 20 }) {
  const conditions = ['u.is_provider = true'];
  const values = [];
  let idx = 1;

  if (category) {
    conditions.push(`u.provider_profile->>'categories' ILIKE $${idx++}`);
    values.push(`%${category}%`);
  }
  if (neighborhood) {
    conditions.push(`u.neighborhood ILIKE $${idx++}`);
    values.push(`%${neighborhood}%`);
  }
  if (minRating) {
    conditions.push(`u.rating_avg >= $${idx++}`);
    values.push(parseFloat(minRating));
  }

  // Reduce visibility for penalized providers
  conditions.push(`(u.visibility_reduced_until IS NULL OR u.visibility_reduced_until < NOW() OR RANDOM() < 0.3)`);

  const offset = (parseInt(page) - 1) * parseInt(limit);
  values.push(parseInt(limit), offset);

  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.photo_url, u.neighborhood, u.bio,
            u.provider_profile, u.rating_avg, u.rating_count, u.visibility_reduced_until
     FROM users u
     WHERE ${conditions.join(' AND ')}
     ORDER BY u.rating_avg DESC NULLS LAST, u.rating_count DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    values
  );
  return rows;
}

async function getProvider(providerId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.photo_url, u.neighborhood, u.bio,
            u.provider_profile, u.rating_avg, u.rating_count, u.created_at
     FROM users u
     WHERE u.id = $1 AND u.is_provider = true`,
    [providerId]
  );
  if (rows.length === 0) throw Object.assign(new Error('Prestador não encontrado'), { status: 404 });

  // Fetch recent visible reviews
  const { rows: reviews } = await pool.query(
    `SELECT r.rating, r.punctuality, r.quality, r.communication, r.comment,
            r.created_at, u.name AS reviewer_name, u.photo_url AS reviewer_photo
     FROM reviews r
     JOIN users u ON u.id = r.reviewer_id
     WHERE r.reviewee_id = $1 AND r.is_visible = true
     ORDER BY r.created_at DESC LIMIT 10`,
    [providerId]
  );
  return { ...rows[0], reviews };
}

async function getProviderAvailability(providerId) {
  // Return services scheduled in the next 30 days (dates only, no personal details)
  const { rows } = await pool.query(
    `SELECT scheduled_date, scheduled_period
     FROM services
     WHERE provider_id = $1
       AND status IN ('accepted','scheduled','in_progress')
       AND scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`,
    [providerId]
  );
  return rows;
}

module.exports = { listProviders, getProvider, getProviderAvailability };
