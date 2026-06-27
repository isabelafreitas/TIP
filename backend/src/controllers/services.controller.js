const { pool } = require('../config/database');
const notificationService = require('../services/notification.service');
const pagarmeService = require('../services/pagarme.service');

// Helper: fetch service and verify the requesting user is a party to it
async function getServiceAndVerifyAccess(serviceId, userId) {
  const { rows } = await pool.query(
    `SELECT s.*,
            r.name AS requester_name, r.photo_url AS requester_photo,
            p.name AS provider_name, p.photo_url AS provider_photo
     FROM services s
     JOIN users r ON r.id = s.requester_id
     JOIN users p ON p.id = s.provider_id
     WHERE s.id = $1`,
    [serviceId]
  );
  if (rows.length === 0) throw Object.assign(new Error('Serviço não encontrado'), { status: 404 });
  const service = rows[0];
  if (service.requester_id !== userId && service.provider_id !== userId) {
    throw Object.assign(new Error('Acesso negado'), { status: 403 });
  }
  return service;
}

async function createService(req, res) {
  try {
    const {
      provider_id,
      description,
      category,
      scheduled_date,
      scheduled_period,
      suggested_price,
      photo_urls,
    } = req.body;

    if (!provider_id || !description || !category) {
      return res.status(400).json({ success: false, error: 'provider_id, description e category são obrigatórios' });
    }

    const { rows: provRows } = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND is_provider = true`,
      [provider_id]
    );
    if (provRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Prestador não encontrado' });
    }

    const { rows } = await pool.query(
      `INSERT INTO services (requester_id, provider_id, description, category, scheduled_date, scheduled_period, suggested_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [req.user.id, provider_id, description, category, scheduled_date || null, scheduled_period || null, suggested_price || null]
    );
    const service = rows[0];

    await pool.query(
      `INSERT INTO chat_sessions (service_id) VALUES ($1) ON CONFLICT (service_id) DO NOTHING`,
      [service.id]
    );

    await notificationService.sendPush(
      provider_id,
      'Nova solicitação de serviço',
      `Você tem uma nova solicitação: ${category}`,
      { service_id: service.id }
    );

    return res.status(201).json({ success: true, data: service });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function createServiceFromCandidacy(req, res) {
  try {
    const { candidacy_id } = req.body;
    if (!candidacy_id) {
      return res.status(400).json({ success: false, error: 'candidacy_id é obrigatório' });
    }

    const { rows: candRows } = await pool.query(
      `SELECT ac.*, a.description, a.expected_price, a.requester_id, a.tags
       FROM announcement_candidacies ac
       JOIN announcements a ON a.id = ac.announcement_id
       WHERE ac.id = $1`,
      [candidacy_id]
    );
    if (candRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Candidatura não encontrada' });
    }
    const candidacy = candRows[0];

    if (candidacy.requester_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Apenas o dono do anúncio pode aceitar candidaturas' });
    }

    const category = (candidacy.tags && candidacy.tags.length > 0) ? candidacy.tags[0] : 'geral';

    const { rows } = await pool.query(
      `INSERT INTO services (requester_id, provider_id, announcement_id, description, category, suggested_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [req.user.id, candidacy.provider_id, candidacy.announcement_id, candidacy.description, category, candidacy.expected_price || null]
    );
    const service = rows[0];

    await pool.query(
      `INSERT INTO chat_sessions (service_id) VALUES ($1) ON CONFLICT (service_id) DO NOTHING`,
      [service.id]
    );

    await pool.query(
      `UPDATE announcements SET status = 'closed' WHERE id = $1`,
      [candidacy.announcement_id]
    );

    await notificationService.sendPush(
      candidacy.provider_id,
      'Candidatura aceita!',
      'Sua candidatura foi aceita. Um serviço foi criado.',
      { service_id: service.id }
    );

    return res.status(201).json({ success: true, data: service });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function getMyServices(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT s.*,
              r.name AS requester_name, r.photo_url AS requester_photo,
              p.name AS provider_name, p.photo_url AS provider_photo
       FROM services s
       JOIN users r ON r.id = s.requester_id
       JOIN users p ON p.id = s.provider_id
       WHERE s.requester_id = $1 OR s.provider_id = $1
       ORDER BY s.updated_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function getService(req, res) {
  try {
    const service = await getServiceAndVerifyAccess(req.params.id, req.user.id);
    return res.json({ success: true, data: service });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function acceptService(req, res) {
  try {
    const service = await getServiceAndVerifyAccess(req.params.id, req.user.id);
    if (service.provider_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Apenas o prestador pode aceitar' });
    }
    if (service.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Status inválido para aceitar: ${service.status}` });
    }

    const { rows } = await pool.query(
      `UPDATE services SET status = 'accepted', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [service.id]
    );

    await notificationService.sendPush(
      service.requester_id,
      'Serviço aceito!',
      'Seu serviço foi aceito. Realize o pagamento para confirmar.',
      { service_id: service.id }
    );

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function declineService(req, res) {
  try {
    const service = await getServiceAndVerifyAccess(req.params.id, req.user.id);
    if (service.provider_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Apenas o prestador pode recusar' });
    }
    if (service.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Status inválido para recusar: ${service.status}` });
    }

    const { rows } = await pool.query(
      `UPDATE services SET status = 'cancelled', cancelled_by = 'provider', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [service.id]
    );

    await notificationService.sendPush(
      service.requester_id,
      'Serviço recusado',
      'O prestador recusou sua solicitação.',
      { service_id: service.id }
    );

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function completeService(req, res) {
  try {
    const service = await getServiceAndVerifyAccess(req.params.id, req.user.id);
    if (service.provider_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Apenas o prestador pode marcar como concluído' });
    }
    if (!['scheduled', 'in_progress', 'accepted'].includes(service.status)) {
      return res.status(400).json({ success: false, error: `Status inválido: ${service.status}` });
    }

    const autoReleaseAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { rows } = await pool.query(
      `UPDATE services SET status = 'completed_by_provider', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [service.id]
    );

    if (service.payment_id) {
      await pool.query(
        `UPDATE payments SET auto_release_at = $1 WHERE id = $2`,
        [autoReleaseAt, service.payment_id]
      );
    }

    await notificationService.sendPush(
      service.requester_id,
      'Serviço concluído!',
      'O prestador marcou o serviço como concluído. Confirme para liberar o pagamento.',
      { service_id: service.id }
    );

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function confirmService(req, res) {
  try {
    const service = await getServiceAndVerifyAccess(req.params.id, req.user.id);
    if (service.requester_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Apenas o solicitante pode confirmar' });
    }
    if (service.status !== 'completed_by_provider') {
      return res.status(400).json({ success: false, error: `Status inválido para confirmar: ${service.status}` });
    }

    const { rows } = await pool.query(
      `UPDATE services SET status = 'confirmed', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [service.id]
    );

    if (service.payment_id) {
      const { rows: payRows } = await pool.query(`SELECT * FROM payments WHERE id = $1`, [service.payment_id]);
      const payment = payRows[0];
      if (payment && payment.status === 'held') {
        await pagarmeService.releasePayment(payment.pagarme_transaction_id, payment.amount_service);
        await pool.query(
          `UPDATE payments SET status = 'released', released_at = NOW(), auto_release_at = NULL WHERE id = $1`,
          [payment.id]
        );
      }
    }

    await notificationService.sendPush(
      service.requester_id,
      'Avalie o prestador',
      'O serviço foi confirmado! Deixe sua avaliação.',
      { service_id: service.id, action: 'review' }
    );
    await notificationService.sendPush(
      service.provider_id,
      'Avalie o solicitante',
      'O serviço foi confirmado! Deixe sua avaliação.',
      { service_id: service.id, action: 'review' }
    );

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function cancelService(req, res) {
  try {
    const service = await getServiceAndVerifyAccess(req.params.id, req.user.id);
    const { cancellation_reason } = req.body;

    if (['cancelled', 'confirmed', 'closed'].includes(service.status)) {
      return res.status(400).json({ success: false, error: `Não é possível cancelar no status: ${service.status}` });
    }

    const isProvider = service.provider_id === req.user.id;
    const cancelledBy = isProvider ? 'provider' : 'requester';
    let refundType = 'none';

    if (service.payment_id) {
      const { rows: payRows } = await pool.query(`SELECT * FROM payments WHERE id = $1`, [service.payment_id]);
      const payment = payRows[0];
      if (payment && payment.status === 'held') {
        if (isProvider) {
          await pagarmeService.refundPayment(payment.pagarme_transaction_id, null);
          await pool.query(`UPDATE payments SET status = 'refunded' WHERE id = $1`, [payment.id]);
          refundType = 'full';
        } else {
          // Requester cancelling: check 12h window
          let cutoffDate;
          if (service.scheduled_date) {
            const periodHours = { morning: 8, afternoon: 13, evening: 18 };
            const hour = periodHours[service.scheduled_period] || 8;
            const scheduledDateTime = new Date(`${service.scheduled_date}T${String(hour).padStart(2,'0')}:00:00`);
            cutoffDate = new Date(scheduledDateTime.getTime() - 12 * 60 * 60 * 1000);
          } else {
            cutoffDate = new Date(new Date(service.created_at).getTime() + 12 * 60 * 60 * 1000);
          }

          if (new Date() < cutoffDate) {
            await pagarmeService.refundPayment(payment.pagarme_transaction_id, null);
            await pool.query(`UPDATE payments SET status = 'refunded' WHERE id = $1`, [payment.id]);
            refundType = 'full';
          } else {
            const refundAmt = parseFloat((payment.amount_service * 0.80).toFixed(2));
            await pagarmeService.refundPayment(payment.pagarme_transaction_id, refundAmt);
            await pool.query(`UPDATE payments SET status = 'partially_refunded' WHERE id = $1`, [payment.id]);
            refundType = 'partial_80pct';
          }
        }
      }
    }

    const { rows } = await pool.query(
      `UPDATE services SET status = 'cancelled', cancelled_by = $1, cancellation_reason = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [cancelledBy, cancellation_reason || null, service.id]
    );

    const notifyUserId = isProvider ? service.requester_id : service.provider_id;
    await notificationService.sendPush(
      notifyUserId,
      'Serviço cancelado',
      `O serviço foi cancelado pelo ${isProvider ? 'prestador' : 'solicitante'}.`,
      { service_id: service.id }
    );

    return res.json({ success: true, data: { ...rows[0], refund_type: refundType } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function requestModification(req, res) {
  try {
    const service = await getServiceAndVerifyAccess(req.params.id, req.user.id);

    if ((service.modification_count || 0) >= 2) {
      return res.status(400).json({
        success: false,
        error: 'Limite de 2 modificações por serviço atingido.',
      });
    }

    if (!['accepted', 'scheduled'].includes(service.status)) {
      return res.status(400).json({ success: false, error: `Modificação não permitida no status: ${service.status}` });
    }

    const { new_date, new_period, reason } = req.body;
    if (!new_date && !new_period) {
      return res.status(400).json({ success: false, error: 'new_date ou new_period é obrigatório' });
    }

    const { rows: modRows } = await pool.query(
      `INSERT INTO service_modifications (service_id, requested_by, new_date, new_period, reason)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [service.id, req.user.id, new_date || null, new_period || null, reason || null]
    );
    const modification = modRows[0];

    // Ensure chat session exists
    const { rows: sessionRows } = await pool.query(
      `SELECT id FROM chat_sessions WHERE service_id = $1`,
      [service.id]
    );
    let sessionId;
    if (sessionRows.length > 0) {
      sessionId = sessionRows[0].id;
    } else {
      const { rows: newSession } = await pool.query(
        `INSERT INTO chat_sessions (service_id) VALUES ($1) RETURNING id`,
        [service.id]
      );
      sessionId = newSession[0].id;
    }

    await pool.query(
      `INSERT INTO messages (session_id, sender_id, type, content, metadata)
       VALUES ($1, $2, 'service_modification_card', $3, $4)`,
      [
        sessionId,
        req.user.id,
        'Solicitação de modificação de data/período',
        JSON.stringify({ modification_id: modification.id, new_date, new_period, reason }),
      ]
    );

    const notifyUserId = req.user.id === service.requester_id ? service.provider_id : service.requester_id;
    await notificationService.sendPush(
      notifyUserId,
      'Solicitação de modificação',
      'Uma modificação de data/período foi solicitada.',
      { service_id: service.id, modification_id: modification.id, action: 'modification_request' }
    );

    return res.status(201).json({ success: true, data: modification });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function acceptModification(req, res) {
  try {
    const service = await getServiceAndVerifyAccess(req.params.id, req.user.id);

    const { rows: modRows } = await pool.query(
      `SELECT * FROM service_modifications WHERE id = $1 AND service_id = $2`,
      [req.params.mod_id, service.id]
    );
    if (modRows.length === 0) return res.status(404).json({ success: false, error: 'Modificação não encontrada' });
    const mod = modRows[0];

    if (mod.requested_by === req.user.id) {
      return res.status(403).json({ success: false, error: 'Você não pode aceitar sua própria solicitação' });
    }
    if (mod.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Modificação já processada' });
    }

    await pool.query(`UPDATE service_modifications SET status = 'accepted' WHERE id = $1`, [mod.id]);

    const updateFields = [];
    const updateValues = [];
    let idx = 1;
    if (mod.new_date) { updateFields.push(`scheduled_date = $${idx++}`); updateValues.push(mod.new_date); }
    if (mod.new_period) { updateFields.push(`scheduled_period = $${idx++}`); updateValues.push(mod.new_period); }
    updateFields.push(`modification_count = modification_count + 1`, `updated_at = NOW()`);
    updateValues.push(service.id);

    const { rows } = await pool.query(
      `UPDATE services SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING *`,
      updateValues
    );

    await notificationService.sendPush(mod.requested_by, 'Modificação aceita', 'Sua solicitação de modificação foi aceita.', { service_id: service.id });

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function declineModification(req, res) {
  try {
    const service = await getServiceAndVerifyAccess(req.params.id, req.user.id);

    const { rows: modRows } = await pool.query(
      `SELECT * FROM service_modifications WHERE id = $1 AND service_id = $2`,
      [req.params.mod_id, service.id]
    );
    if (modRows.length === 0) return res.status(404).json({ success: false, error: 'Modificação não encontrada' });
    const mod = modRows[0];

    if (mod.requested_by === req.user.id) {
      return res.status(403).json({ success: false, error: 'Você não pode recusar sua própria solicitação' });
    }
    if (mod.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Modificação já processada' });
    }

    await pool.query(`UPDATE service_modifications SET status = 'declined' WHERE id = $1`, [mod.id]);

    await notificationService.sendPush(mod.requested_by, 'Modificação recusada', 'Sua solicitação de modificação foi recusada.', { service_id: service.id });

    return res.json({ success: true, data: { id: mod.id, status: 'declined' } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createService,
  createServiceFromCandidacy,
  getMyServices,
  getService,
  acceptService,
  declineService,
  completeService,
  confirmService,
  cancelService,
  requestModification,
  acceptModification,
  declineModification,
};
