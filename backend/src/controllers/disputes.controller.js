const { pool } = require('../config/database');
const notificationService = require('../services/notification.service');

async function openDispute(req, res) {
  try {
    const { service_id, description, photo_urls } = req.body;
    if (!service_id || !description) {
      return res.status(400).json({ success: false, error: 'service_id e description são obrigatórios' });
    }
    if (!photo_urls || !Array.isArray(photo_urls) || photo_urls.length === 0) {
      return res.status(400).json({ success: false, error: 'Pelo menos uma foto é obrigatória' });
    }

    const { rows: svcRows } = await pool.query(`SELECT * FROM services WHERE id = $1`, [service_id]);
    if (svcRows.length === 0) return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
    const service = svcRows[0];

    // Only requester can open dispute
    if (service.requester_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Apenas o solicitante pode abrir uma disputa' });
    }

    // Only within 24h of confirmed status
    if (service.status !== 'confirmed') {
      return res.status(400).json({ success: false, error: 'Disputas só podem ser abertas após confirmação do serviço' });
    }

    const confirmedAt = new Date(service.updated_at);
    const now = new Date();
    const hoursDiff = (now - confirmedAt) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      return res.status(400).json({ success: false, error: 'O prazo de 24h para abertura de disputa expirou' });
    }

    const { rows } = await pool.query(
      `INSERT INTO disputes (service_id, opened_by, description, photo_urls)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [service_id, req.user.id, description, photo_urls]
    );

    // Update service status
    await pool.query(
      `UPDATE services SET status = 'disputed', updated_at = NOW() WHERE id = $1`,
      [service_id]
    );

    // Suspend auto-release
    if (service.payment_id) {
      await pool.query(`UPDATE payments SET auto_release_at = NULL WHERE id = $1`, [service.payment_id]);
    }

    await notificationService.sendPush(
      service.provider_id,
      'Disputa aberta',
      'Uma disputa foi aberta para um de seus serviços. Responda em até 48h.',
      { service_id, dispute_id: rows[0].id }
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function getDispute(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT d.*, s.requester_id, s.provider_id FROM disputes d JOIN services s ON s.id = d.service_id WHERE d.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Disputa não encontrada' });
    const dispute = rows[0];

    if (dispute.requester_id !== req.user.id && dispute.provider_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }

    return res.json({ success: true, data: dispute });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function respondToDispute(req, res) {
  try {
    const { description, photo_urls } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, error: 'Descrição da resposta é obrigatória' });
    }

    const { rows: dispRows } = await pool.query(
      `SELECT d.*, s.requester_id, s.provider_id FROM disputes d JOIN services s ON s.id = d.service_id WHERE d.id = $1`,
      [req.params.id]
    );
    if (dispRows.length === 0) return res.status(404).json({ success: false, error: 'Disputa não encontrada' });
    const dispute = dispRows[0];

    // Only provider can respond
    if (dispute.provider_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Apenas o prestador pode responder a uma disputa' });
    }
    if (dispute.status !== 'open') {
      return res.status(400).json({ success: false, error: 'Esta disputa já foi respondida' });
    }

    const { rows } = await pool.query(
      `UPDATE disputes SET response_description = $1, response_photo_urls = $2, status = 'responded'
       WHERE id = $3 RETURNING *`,
      [description, photo_urls || [], req.params.id]
    );

    await notificationService.sendPush(
      dispute.requester_id,
      'Resposta à disputa',
      'O prestador respondeu à sua disputa.',
      { dispute_id: dispute.id, service_id: dispute.service_id }
    );

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

module.exports = { openDispute, getDispute, respondToDispute };
