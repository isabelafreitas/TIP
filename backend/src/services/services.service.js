const { pool } = require('../config/database');

async function createService(requesterId, { providerId, announcementId, description, category, scheduledDate, scheduledPeriod, suggestedPrice }) {
  const { rows } = await pool.query(
    `INSERT INTO services (requester_id, provider_id, announcement_id, description, category, scheduled_date, scheduled_period, suggested_price)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [requesterId, providerId, announcementId || null, description, category,
     scheduledDate || null, scheduledPeriod || null, suggestedPrice || null]
  );
  // Create chat session
  await pool.query('INSERT INTO chat_sessions (service_id) VALUES ($1) ON CONFLICT DO NOTHING', [rows[0].id]);
  return rows[0];
}

async function getService(serviceId, userId) {
  const { rows } = await pool.query(
    `SELECT s.*,
            r.name AS requester_name, r.photo_url AS requester_photo,
            p.name AS provider_name, p.photo_url AS provider_photo
     FROM services s
     JOIN users r ON r.id = s.requester_id
     JOIN users p ON p.id = s.provider_id
     WHERE s.id = $1 AND (s.requester_id = $2 OR s.provider_id = $2)`,
    [serviceId, userId]
  );
  if (rows.length === 0) throw Object.assign(new Error('Serviço não encontrado'), { status: 404 });
  return rows[0];
}

async function acceptService(serviceId, providerId, { agreedPrice, scheduledDate, scheduledPeriod }) {
  const { rows: svc } = await pool.query(
    `SELECT * FROM services WHERE id = $1 AND provider_id = $2`,
    [serviceId, providerId]
  );
  if (svc.length === 0) throw Object.assign(new Error('Serviço não encontrado'), { status: 404 });
  if (svc[0].status !== 'pending') throw Object.assign(new Error('Serviço não está pendente'), { status: 400 });

  const { rows } = await pool.query(
    `UPDATE services
     SET status = 'accepted', agreed_price = $1, scheduled_date = $2, scheduled_period = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [agreedPrice, scheduledDate, scheduledPeriod, serviceId]
  );
  return rows[0];
}

async function cancelService(serviceId, userId, { reason }) {
  const { rows: svc } = await pool.query(
    `SELECT * FROM services WHERE id = $1 AND (requester_id = $2 OR provider_id = $2)`,
    [serviceId, userId]
  );
  if (svc.length === 0) throw Object.assign(new Error('Serviço não encontrado'), { status: 404 });
  const s = svc[0];
  const cancellable = ['pending','accepted','scheduled'];
  if (!cancellable.includes(s.status)) throw Object.assign(new Error('Serviço não pode ser cancelado neste estado'), { status: 400 });

  const cancelledBy = s.requester_id === userId ? 'requester' : 'provider';
  const { rows } = await pool.query(
    `UPDATE services SET status = 'cancelled', cancelled_by = $1, cancellation_reason = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [cancelledBy, reason || null, serviceId]
  );

  // Track cancellations for providers
  if (cancelledBy === 'provider') {
    await pool.query(
      `UPDATE users SET cancellation_count_30d = cancellation_count_30d + 1 WHERE id = $1`,
      [s.provider_id]
    );
  }

  // If payment held, trigger refund
  if (s.payment_id) {
    const { rows: pay } = await pool.query('SELECT * FROM payments WHERE id = $1', [s.payment_id]);
    if (pay.length > 0 && pay[0].status === 'held') {
      const pagarme = require('./pagarme.service');
      await pagarme.refundPayment(pay[0].pagarme_transaction_id);
      await pool.query(`UPDATE payments SET status = 'refunded' WHERE id = $1`, [s.payment_id]);
    }
  }

  return rows[0];
}

async function markInProgress(serviceId, providerId) {
  const { rows } = await pool.query(
    `UPDATE services SET status = 'in_progress', updated_at = NOW()
     WHERE id = $1 AND provider_id = $2 AND status = 'scheduled'
     RETURNING *`,
    [serviceId, providerId]
  );
  if (rows.length === 0) throw Object.assign(new Error('Serviço não encontrado ou status inválido'), { status: 400 });
  return rows[0];
}

async function markCompletedByProvider(serviceId, providerId) {
  const { rows } = await pool.query(
    `UPDATE services SET status = 'completed_by_provider', updated_at = NOW()
     WHERE id = $1 AND provider_id = $2 AND status = 'in_progress'
     RETURNING *`,
    [serviceId, providerId]
  );
  if (rows.length === 0) throw Object.assign(new Error('Serviço não encontrado ou status inválido'), { status: 400 });

  // Set auto-release at 48h
  if (rows[0].payment_id) {
    await pool.query(
      `UPDATE payments SET auto_release_at = NOW() + INTERVAL '48 hours' WHERE id = $1`,
      [rows[0].payment_id]
    );
  }
  return rows[0];
}

async function confirmService(serviceId, requesterId) {
  const { rows: svc } = await pool.query(
    `SELECT * FROM services WHERE id = $1 AND requester_id = $2 AND status = 'completed_by_provider'`,
    [serviceId, requesterId]
  );
  if (svc.length === 0) throw Object.assign(new Error('Serviço não encontrado ou status inválido'), { status: 400 });

  const { rows } = await pool.query(
    `UPDATE services SET status = 'confirmed', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [serviceId]
  );

  // Release payment
  if (svc[0].payment_id) {
    const { rows: pay } = await pool.query('SELECT * FROM payments WHERE id = $1', [svc[0].payment_id]);
    if (pay.length > 0 && pay[0].status === 'held') {
      const pagarme = require('./pagarme.service');
      await pagarme.releasePayment(pay[0].pagarme_transaction_id, pay[0].amount_service);
      await pool.query(
        `UPDATE payments SET status = 'released', released_at = NOW() WHERE id = $1`,
        [svc[0].payment_id]
      );
    }
  }

  // Unlock reviews (both sides can review now)
  const { rows: revRows } = await pool.query(
    `SELECT id FROM reviews WHERE service_id = $1`, [serviceId]
  );
  if (revRows.length === 0) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    // Insert placeholder rows so both sides can fill them
    await pool.query(
      `INSERT INTO reviews (service_id, reviewer_id, reviewee_id, rating, expires_at, is_visible)
       VALUES ($1, $2, $3, 0, $4, false), ($1, $3, $2, 0, $4, false)
       ON CONFLICT DO NOTHING`,
      [serviceId, svc[0].requester_id, svc[0].provider_id, expiresAt]
    );
  }

  return rows[0];
}

async function requestModification(serviceId, userId, { newDate, newPeriod, reason }) {
  const { rows: svc } = await pool.query(
    `SELECT * FROM services WHERE id = $1 AND (requester_id = $2 OR provider_id = $2)`,
    [serviceId, userId]
  );
  if (svc.length === 0) throw Object.assign(new Error('Serviço não encontrado'), { status: 404 });
  if (svc[0].modification_count >= 3) {
    throw Object.assign(new Error('Limite de modificações atingido (máximo 3)'), { status: 400 });
  }
  const { rows } = await pool.query(
    `INSERT INTO service_modifications (service_id, requested_by, new_date, new_period, reason)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [serviceId, userId, newDate || null, newPeriod || null, reason || null]
  );
  return rows[0];
}

async function respondModification(modificationId, userId, { accept }) {
  const { rows: mod } = await pool.query(
    `SELECT sm.*, s.requester_id, s.provider_id
     FROM service_modifications sm
     JOIN services s ON s.id = sm.service_id
     WHERE sm.id = $1 AND sm.status = 'pending'`,
    [modificationId]
  );
  if (mod.length === 0) throw Object.assign(new Error('Modificação não encontrada'), { status: 404 });
  const m = mod[0];
  // Only the OTHER party can accept/decline
  if (m.requested_by === userId) throw Object.assign(new Error('Você não pode responder à própria solicitação'), { status: 400 });

  const status = accept ? 'accepted' : 'declined';
  await pool.query(`UPDATE service_modifications SET status = $1 WHERE id = $2`, [status, modificationId]);

  if (accept) {
    const updates = [];
    const vals = [];
    let i = 1;
    if (m.new_date) { updates.push(`scheduled_date = $${i++}`); vals.push(m.new_date); }
    if (m.new_period) { updates.push(`scheduled_period = $${i++}`); vals.push(m.new_period); }
    updates.push(`modification_count = modification_count + 1`, `updated_at = NOW()`);
    vals.push(m.service_id);
    await pool.query(`UPDATE services SET ${updates.join(', ')} WHERE id = $${i}`, vals);
  }

  return { modificationId, status };
}

async function reportNonAttendance(serviceId, requesterId) {
  const { rows: svc } = await pool.query(
    `SELECT * FROM services WHERE id = $1 AND requester_id = $2`,
    [serviceId, requesterId]
  );
  if (svc.length === 0) throw Object.assign(new Error('Serviço não encontrado'), { status: 404 });
  if (svc[0].status !== 'scheduled') throw Object.assign(new Error('Serviço precisa estar agendado'), { status: 400 });

  const { rows } = await pool.query(
    `INSERT INTO non_attendance_records (provider_id, service_id) VALUES ($1, $2) RETURNING *`,
    [svc[0].provider_id, serviceId]
  );

  // Cancel service and refund
  await pool.query(
    `UPDATE services SET status = 'cancelled', cancelled_by = 'provider', cancellation_reason = 'non_attendance', updated_at = NOW() WHERE id = $1`,
    [serviceId]
  );

  if (svc[0].payment_id) {
    const { rows: pay } = await pool.query('SELECT * FROM payments WHERE id = $1', [svc[0].payment_id]);
    if (pay.length > 0 && pay[0].status === 'held') {
      const pagarme = require('./pagarme.service');
      await pagarme.refundPayment(pay[0].pagarme_transaction_id);
      await pool.query(`UPDATE payments SET status = 'refunded' WHERE id = $1`, [svc[0].payment_id]);
    }
  }

  // Penalize provider visibility
  await pool.query(
    `UPDATE users SET visibility_reduced_until = NOW() + INTERVAL '30 days' WHERE id = $1`,
    [svc[0].provider_id]
  );

  return rows[0];
}

module.exports = {
  createService, getService, acceptService, cancelService,
  markInProgress, markCompletedByProvider, confirmService,
  requestModification, respondModification, reportNonAttendance,
};
