const { pool } = require('../config/database');

async function saveProvider(userId, providerId) {
  if (userId === providerId) throw Object.assign(new Error('Você não pode salvar a si mesmo'), { status: 400 });

  // Verify provider exists and is a provider
  const { rows } = await pool.query(
    `SELECT id FROM users WHERE id = $1 AND is_provider = true`, [providerId]
  );
  if (rows.length === 0) throw Object.assign(new Error('Prestador não encontrado'), { status: 404 });

  await pool.query(
    `INSERT INTO saved_providers (user_id, provider_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [userId, providerId]
  );
  return { saved: true, providerId };
}

async function unsaveProvider(userId, providerId) {
  await pool.query(
    `DELETE FROM saved_providers WHERE user_id = $1 AND provider_id = $2`,
    [userId, providerId]
  );
  return { saved: false, providerId };
}

async function getSavedProviders(userId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.photo_url, u.neighborhood, u.bio,
            u.provider_profile, u.rating_avg, u.rating_count, sp.saved_at
     FROM saved_providers sp
     JOIN users u ON u.id = sp.provider_id
     WHERE sp.user_id = $1
     ORDER BY sp.saved_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = { saveProvider, unsaveProvider, getSavedProviders };
