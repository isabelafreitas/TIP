const { pool } = require('../config/database');

async function submitReview(req, res) {
  try {
    const { service_id, rating, punctuality, quality, communication, comment } = req.body;

    if (!service_id || !rating) {
      return res.status(400).json({ success: false, error: 'service_id e rating são obrigatórios' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating deve ser entre 1 e 5' });
    }
    if (comment && comment.length > 300) {
      return res.status(400).json({ success: false, error: 'Comentário deve ter no máximo 300 caracteres' });
    }

    // Get service
    const { rows: svcRows } = await pool.query(`SELECT * FROM services WHERE id = $1`, [service_id]);
    if (svcRows.length === 0) return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
    const service = svcRows[0];

    // Service must be confirmed
    if (service.status !== 'confirmed') {
      return res.status(400).json({ success: false, error: 'Avaliações só são permitidas após a confirmação do serviço' });
    }

    // Check user is a party
    const isRequester = service.requester_id === req.user.id;
    const isProvider = service.provider_id === req.user.id;
    if (!isRequester && !isProvider) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }

    // Check payment >= 15
    if (service.payment_id) {
      const { rows: payRows } = await pool.query(`SELECT * FROM payments WHERE id = $1`, [service.payment_id]);
      if (payRows.length > 0 && parseFloat(payRows[0].amount_service) < 15) {
        return res.status(400).json({ success: false, error: 'Avaliações só são permitidas para serviços com valor mínimo de R$15' });
      }
    }

    // Check not already reviewed
    const { rows: existingRows } = await pool.query(
      `SELECT id FROM reviews WHERE service_id = $1 AND reviewer_id = $2`,
      [service_id, req.user.id]
    );
    if (existingRows.length > 0) {
      return res.status(409).json({ success: false, error: 'Você já avaliou este serviço' });
    }

    // Determine who is being reviewed
    const revieweeId = isRequester ? service.provider_id : service.requester_id;

    // Reviews expire 72h after service confirmation
    const expiresAt = new Date(new Date(service.updated_at).getTime() + 72 * 60 * 60 * 1000);

    const { rows } = await pool.query(
      `INSERT INTO reviews (service_id, reviewer_id, reviewee_id, rating, punctuality, quality, communication, comment, is_visible, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9) RETURNING *`,
      [service_id, req.user.id, revieweeId, rating, punctuality || null, quality || null, communication || null, comment || null, expiresAt]
    );
    const review = rows[0];

    // Check if both parties have reviewed
    const { rows: bothReviews } = await pool.query(
      `SELECT id FROM reviews WHERE service_id = $1`,
      [service_id]
    );
    if (bothReviews.length >= 2) {
      // Make both reviews visible
      await pool.query(`UPDATE reviews SET is_visible = true WHERE service_id = $1`, [service_id]);

      // Recalculate ratings for both parties
      const partyIds = [service.requester_id, service.provider_id];
      for (const uid of partyIds) {
        await recalculateRating(uid);
      }
    }

    return res.status(201).json({ success: true, data: review });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function recalculateRating(userId) {
  const { rows } = await pool.query(
    `SELECT AVG(rating)::numeric(3,2) AS avg, COUNT(*)::int AS cnt
     FROM reviews WHERE reviewee_id = $1 AND is_visible = true`,
    [userId]
  );
  await pool.query(
    `UPDATE users SET rating_avg = $1, rating_count = $2, updated_at = NOW() WHERE id = $3`,
    [rows[0].avg || null, rows[0].cnt, userId]
  );
}

async function getPendingReviews(req, res) {
  try {
    // Services confirmed where user hasn't reviewed yet and payment >= 15
    const { rows } = await pool.query(
      `SELECT s.id AS service_id, s.status, s.updated_at AS confirmed_at,
              s.requester_id, s.provider_id,
              r.name AS requester_name, r.photo_url AS requester_photo,
              p.name AS provider_name, p.photo_url AS provider_photo,
              pay.amount_service
       FROM services s
       JOIN users r ON r.id = s.requester_id
       JOIN users p ON p.id = s.provider_id
       LEFT JOIN payments pay ON pay.id = s.payment_id
       WHERE s.status = 'confirmed'
         AND (s.requester_id = $1 OR s.provider_id = $1)
         AND (pay.amount_service IS NULL OR pay.amount_service >= 15)
         AND NOT EXISTS (
           SELECT 1 FROM reviews rv WHERE rv.service_id = s.id AND rv.reviewer_id = $1
         )
       ORDER BY s.updated_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

module.exports = { submitReview, getPendingReviews, recalculateRating };
