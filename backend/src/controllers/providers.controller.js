const { pool } = require('../config/database');

async function listProviders(req, res) {
  try {
    const { category, max_price, level, date, lat, lng, limit = 20, offset = 0 } = req.query;

    const conditions = ['u.is_provider = true'];
    const values = [];
    let idx = 1;

    if (category) {
      conditions.push(`u.provider_profile->'categories' @> $${idx++}::jsonb`);
      values.push(JSON.stringify([category]));
    }

    if (max_price) {
      conditions.push(`(u.provider_profile->>'price_range')::numeric <= $${idx++}`);
      values.push(parseFloat(max_price));
    }

    if (level) {
      conditions.push(`u.provider_profile->>'level' = $${idx++}`);
      values.push(level);
    }

    if (date) {
      // Exclude providers who have a service scheduled on this date
      conditions.push(`u.id NOT IN (
        SELECT provider_id FROM services
        WHERE scheduled_date = $${idx++}::date
          AND status IN ('accepted','scheduled','in_progress')
      )`);
      values.push(date);
    }

    const hasLocation = lat && lng;
    let distanceSelect = '';
    let orderBy = '';

    if (hasLocation) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      // Simple Haversine-like distance using lat/lng stored in provider_profile
      distanceSelect = `,
        CASE WHEN u.provider_profile->>'lat' IS NOT NULL AND u.provider_profile->>'lng' IS NOT NULL THEN
          6371 * 2 * ASIN(SQRT(
            POWER(SIN(RADIANS((u.provider_profile->>'lat')::float - ${latNum}) / 2), 2) +
            COS(RADIANS(${latNum})) * COS(RADIANS((u.provider_profile->>'lat')::float)) *
            POWER(SIN(RADIANS((u.provider_profile->>'lng')::float - ${lngNum}) / 2), 2)
          ))
        ELSE NULL END AS distance`;

      orderBy = `ORDER BY
        CASE WHEN u.visibility_reduced_until IS NOT NULL AND u.visibility_reduced_until > NOW() THEN 1 ELSE 0 END ASC,
        distance ASC NULLS LAST,
        u.rating_avg DESC NULLS LAST`;
    } else {
      orderBy = `ORDER BY
        CASE WHEN u.visibility_reduced_until IS NOT NULL AND u.visibility_reduced_until > NOW() THEN 1 ELSE 0 END ASC,
        u.rating_avg DESC NULLS LAST,
        u.rating_count DESC`;
    }

    values.push(parseInt(limit), parseInt(offset));

    const query = `
      SELECT u.id, u.name, u.photo_url, u.neighborhood, u.rating_avg, u.rating_count,
             u.provider_profile, u.visibility_reduced_until${distanceSelect}
      FROM users u
      WHERE ${conditions.join(' AND ')}
      ${orderBy}
      LIMIT $${idx++} OFFSET $${idx}
    `;

    const { rows } = await pool.query(query, values);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function searchProviders(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Parâmetro de busca q é obrigatório' });
    }

    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.photo_url, u.neighborhood, u.rating_avg, u.rating_count, u.provider_profile
       FROM users u
       WHERE u.is_provider = true
         AND (
           u.name ILIKE $1
           OR u.provider_profile::text ILIKE $1
         )
       ORDER BY u.rating_avg DESC NULLS LAST
       LIMIT 50`,
      [`%${q}%`]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

module.exports = { listProviders, searchProviders };
