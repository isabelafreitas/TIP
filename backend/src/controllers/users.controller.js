const { pool } = require('../config/database');
const usersService = require('../services/users.service');
const pagarmeService = require('../services/pagarme.service');

async function getMe(req, res) {
  try {
    const user = await usersService.getProfile(req.user.id);
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function updateMe(req, res) {
  try {
    const { name, neighborhood, bio, photo_url } = req.body;
    const user = await usersService.updateProfile(req.user.id, { name, neighborhood, bio, photo_url });
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function updateProviderProfile(req, res) {
  try {
    const { is_provider, provider_profile } = req.body;
    const userId = req.user.id;

    // If activating provider mode, create a pagarme recipient stub
    if (is_provider === true) {
      const current = await usersService.getProfile(userId);
      if (!current.is_provider) {
        console.log(`[PAGARME STUB] createRecipient userId=${userId}`);
        // In production: create pagarme recipient and store recipient_id in provider_profile
      }
    }

    const user = await usersService.updateProfile(userId, { is_provider, provider_profile });
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function getPublicProfile(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, photo_url, neighborhood, bio, is_provider, provider_profile,
              rating_avg, rating_count, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function getUserReviews(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.rating, r.punctuality, r.quality, r.communication, r.comment, r.created_at,
              u.id AS reviewer_id, u.name AS reviewer_name, u.photo_url AS reviewer_photo
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewee_id = $1 AND r.is_visible = true
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

module.exports = { getMe, updateMe, updateProviderProfile, getPublicProfile, getUserReviews };
