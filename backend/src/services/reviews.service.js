const { pool } = require('../config/database');

async function submitReview(serviceId, reviewerId, { rating, punctuality, quality, communication, comment }) {
  // Verify service is confirmed and reviewer is a party
  const { rows: svc } = await pool.query(
    `SELECT * FROM services WHERE id = $1 AND status = 'confirmed' AND (requester_id = $2 OR provider_id = $2)`,
    [serviceId, reviewerId]
  );
  if (svc.length === 0) throw Object.assign(new Error('Serviço não encontrado ou não elegível para avaliação'), { status: 404 });

  const s = svc[0];
  const revieweeId = s.requester_id === reviewerId ? s.provider_id : s.requester_id;

  // Check existing review placeholder
  const { rows: existing } = await pool.query(
    `SELECT id, is_visible FROM reviews WHERE service_id = $1 AND reviewer_id = $2`,
    [serviceId, reviewerId]
  );

  let review;
  if (existing.length > 0) {
    const { rows } = await pool.query(
      `UPDATE reviews SET rating = $1, punctuality = $2, quality = $3, communication = $4, comment = $5
       WHERE service_id = $6 AND reviewer_id = $7 RETURNING *`,
      [rating, punctuality || null, quality || null, communication || null, comment || null, serviceId, reviewerId]
    );
    review = rows[0];
  } else {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const { rows } = await pool.query(
      `INSERT INTO reviews (service_id, reviewer_id, reviewee_id, rating, punctuality, quality, communication, comment, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [serviceId, reviewerId, revieweeId, rating, punctuality || null, quality || null, communication || null, comment || null, expiresAt]
    );
    review = rows[0];
  }

  // Check if both sides have reviewed → make both visible
  const { rows: both } = await pool.query(
    `SELECT id FROM reviews WHERE service_id = $1 AND rating > 0`,
    [serviceId]
  );
  if (both.length >= 2) {
    await pool.query(`UPDATE reviews SET is_visible = true WHERE service_id = $1`, [serviceId]);
    // Recompute rating averages
    await recomputeRating(revieweeId);
    await recomputeRating(reviewerId);
  }

  return review;
}

async function recomputeRating(userId) {
  await pool.query(
    `UPDATE users SET
       rating_avg = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = $1 AND is_visible = true AND rating > 0),
       rating_count = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1 AND is_visible = true AND rating > 0)
     WHERE id = $1`,
    [userId]
  );
}

async function getReviewsForUser(userId, { page = 1, limit = 20 } = {}) {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { rows } = await pool.query(
    `SELECT r.*, u.name AS reviewer_name, u.photo_url AS reviewer_photo
     FROM reviews r
     JOIN users u ON u.id = r.reviewer_id
     WHERE r.reviewee_id = $1 AND r.is_visible = true AND r.rating > 0
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, parseInt(limit), offset]
  );
  return rows;
}

module.exports = { submitReview, getReviewsForUser, recomputeRating };
