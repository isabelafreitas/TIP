const { pool } = require('../config/database');

async function getSavedProviders(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.photo_url, u.neighborhood, u.bio,
              u.provider_profile, u.rating_avg, u.rating_count,
              sp.saved_at
       FROM saved_providers sp
       JOIN users u ON u.id = sp.provider_id
       WHERE sp.user_id = $1
       ORDER BY sp.saved_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function saveProvider(req, res) {
  try {
    const { provider_id } = req.params;

    // Verify provider exists
    const { rows: provRows } = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND is_provider = true`,
      [provider_id]
    );
    if (provRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Prestador não encontrado' });
    }

    await pool.query(
      `INSERT INTO saved_providers (user_id, provider_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, provider_id]
    );

    return res.status(201).json({ success: true, data: { saved: true } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function unsaveProvider(req, res) {
  try {
    const { provider_id } = req.params;
    await pool.query(
      `DELETE FROM saved_providers WHERE user_id = $1 AND provider_id = $2`,
      [req.user.id, provider_id]
    );
    return res.json({ success: true, data: { saved: false } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

module.exports = { getSavedProviders, saveProvider, unsaveProvider };
