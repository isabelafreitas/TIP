const { pool } = require('../config/database');
const announcementsService = require('../services/announcements.service');

const VALID_EXPIRES = { 24: true, 48: true, 72: true, 168: true };

async function createAnnouncement(req, res) {
  try {
    const { description, tags, expected_price, expires_in } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, error: 'Descrição é obrigatória' });
    }
    const hours = parseInt(expires_in) || 24;
    if (!VALID_EXPIRES[hours]) {
      return res.status(400).json({ success: false, error: 'expires_in deve ser 24, 48, 72 ou 168 horas' });
    }
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    const announcement = await announcementsService.createAnnouncement(req.user.id, {
      description,
      tags,
      expectedPrice: expected_price,
      expiresAt,
    });
    return res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function getMyAnnouncements(req, res) {
  try {
    const announcements = await announcementsService.getMyAnnouncements(req.user.id);
    return res.json({ success: true, data: announcements });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function getAvailableAnnouncements(req, res) {
  try {
    // Get provider's categories from their profile
    const { rows: userRows } = await pool.query(
      `SELECT provider_profile FROM users WHERE id = $1`,
      [req.user.id]
    );
    const profile = userRows[0]?.provider_profile;
    const categories = profile?.categories || [];

    // Get active announcements matching provider's categories (or all if no categories)
    let query;
    let values;

    if (categories.length > 0) {
      query = `
        SELECT a.*, u.name AS requester_name, u.photo_url AS requester_photo, u.neighborhood
        FROM announcements a
        JOIN users u ON u.id = a.requester_id
        WHERE a.status = 'active'
          AND a.expires_at > NOW()
          AND a.requester_id != $1
          AND (a.tags && $2::text[] OR a.tags IS NULL OR array_length(a.tags, 1) IS NULL)
        ORDER BY a.created_at DESC
        LIMIT 50
      `;
      values = [req.user.id, categories];
    } else {
      query = `
        SELECT a.*, u.name AS requester_name, u.photo_url AS requester_photo, u.neighborhood
        FROM announcements a
        JOIN users u ON u.id = a.requester_id
        WHERE a.status = 'active'
          AND a.expires_at > NOW()
          AND a.requester_id != $1
        ORDER BY a.created_at DESC
        LIMIT 50
      `;
      values = [req.user.id];
    }

    const { rows } = await pool.query(query, values);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function applyToAnnouncement(req, res) {
  try {
    // Must be a provider
    const { rows: userRows } = await pool.query(
      `SELECT is_provider FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!userRows[0]?.is_provider) {
      return res.status(403).json({ success: false, error: 'Apenas prestadores podem se candidatar' });
    }

    const { message } = req.body;
    const candidacy = await announcementsService.applyCandidacy(req.params.id, req.user.id, message);
    return res.status(201).json({ success: true, data: candidacy });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function getCandidacies(req, res) {
  try {
    // Only announcement owner can see candidacies
    const { rows: annRows } = await pool.query(
      `SELECT requester_id FROM announcements WHERE id = $1`,
      [req.params.id]
    );
    if (annRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Anúncio não encontrado' });
    }
    if (annRows[0].requester_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }

    const { rows } = await pool.query(
      `SELECT ac.id, ac.message, ac.created_at,
              u.id AS provider_id, u.name, u.photo_url, u.rating_avg, u.rating_count, u.provider_profile
       FROM announcement_candidacies ac
       JOIN users u ON u.id = ac.provider_id
       WHERE ac.announcement_id = $1
       ORDER BY ac.created_at ASC`,
      [req.params.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function closeAnnouncement(req, res) {
  try {
    const announcement = await announcementsService.closeAnnouncement(req.params.id, req.user.id);
    return res.json({ success: true, data: announcement });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createAnnouncement,
  getMyAnnouncements,
  getAvailableAnnouncements,
  applyToAnnouncement,
  getCandidacies,
  closeAnnouncement,
};
