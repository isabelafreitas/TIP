const { pool } = require('../config/database');

async function createAnnouncement(requesterId, { description, tags, expectedPrice, expiresAt }) {
  const { rows } = await pool.query(
    `INSERT INTO announcements (requester_id, description, tags, expected_price, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [requesterId, description, tags || [], expectedPrice || null, expiresAt]
  );
  return rows[0];
}

async function listAnnouncements({ tags, minPrice, maxPrice, page = 1, limit = 20 }) {
  const conditions = ["a.status = 'active'", 'a.expires_at > NOW()'];
  const values = [];
  let idx = 1;

  if (tags && tags.length > 0) {
    conditions.push(`a.tags && $${idx++}`);
    values.push(tags);
  }
  if (minPrice) {
    conditions.push(`a.expected_price >= $${idx++}`);
    values.push(parseFloat(minPrice));
  }
  if (maxPrice) {
    conditions.push(`a.expected_price <= $${idx++}`);
    values.push(parseFloat(maxPrice));
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  values.push(parseInt(limit), offset);

  const { rows } = await pool.query(
    `SELECT a.*, u.name AS requester_name, u.photo_url AS requester_photo, u.neighborhood
     FROM announcements a
     JOIN users u ON u.id = a.requester_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    values
  );
  return rows;
}

async function getAnnouncement(announcementId) {
  const { rows } = await pool.query(
    `SELECT a.*, u.name AS requester_name, u.photo_url AS requester_photo, u.neighborhood, u.rating_avg
     FROM announcements a
     JOIN users u ON u.id = a.requester_id
     WHERE a.id = $1`,
    [announcementId]
  );
  if (rows.length === 0) throw Object.assign(new Error('Anúncio não encontrado'), { status: 404 });

  const { rows: candidacies } = await pool.query(
    `SELECT ac.id, ac.message, ac.created_at, u.id AS provider_id, u.name, u.photo_url, u.rating_avg
     FROM announcement_candidacies ac
     JOIN users u ON u.id = ac.provider_id
     WHERE ac.announcement_id = $1`,
    [announcementId]
  );
  return { ...rows[0], candidacies };
}

async function closeAnnouncement(announcementId, requesterId) {
  const { rows } = await pool.query(
    `UPDATE announcements SET status = 'closed'
     WHERE id = $1 AND requester_id = $2
     RETURNING *`,
    [announcementId, requesterId]
  );
  if (rows.length === 0) throw Object.assign(new Error('Anúncio não encontrado ou sem permissão'), { status: 404 });
  return rows[0];
}

async function applyCandidacy(announcementId, providerId, message) {
  // Check announcement is active
  const { rows: ann } = await pool.query(
    `SELECT id, requester_id, status, expires_at FROM announcements WHERE id = $1`,
    [announcementId]
  );
  if (ann.length === 0) throw Object.assign(new Error('Anúncio não encontrado'), { status: 404 });
  if (ann[0].status !== 'active' || new Date(ann[0].expires_at) < new Date()) {
    throw Object.assign(new Error('Anúncio não está ativo'), { status: 400 });
  }
  if (ann[0].requester_id === providerId) {
    throw Object.assign(new Error('Você não pode se candidatar ao próprio anúncio'), { status: 400 });
  }

  const { rows } = await pool.query(
    `INSERT INTO announcement_candidacies (announcement_id, provider_id, message)
     VALUES ($1, $2, $3)
     ON CONFLICT (announcement_id, provider_id) DO UPDATE SET message = EXCLUDED.message
     RETURNING *`,
    [announcementId, providerId, message || null]
  );
  return rows[0];
}

async function getMyAnnouncements(requesterId) {
  const { rows } = await pool.query(
    `SELECT a.*, COUNT(ac.id)::int AS candidacy_count
     FROM announcements a
     LEFT JOIN announcement_candidacies ac ON ac.announcement_id = a.id
     WHERE a.requester_id = $1
     GROUP BY a.id
     ORDER BY a.created_at DESC`,
    [requesterId]
  );
  return rows;
}

module.exports = { createAnnouncement, listAnnouncements, getAnnouncement, closeAnnouncement, applyCandidacy, getMyAnnouncements };
