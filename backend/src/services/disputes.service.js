const { pool } = require('../config/database');
const pagarme = require('./pagarme.service');

async function openDispute(serviceId, userId, { description, photoUrls }) {
  const { rows: svc } = await pool.query(
    `SELECT * FROM services WHERE id = $1 AND (requester_id = $2 OR provider_id = $2)
     AND status = 'completed_by_provider'`,
    [serviceId, userId]
  );
  if (svc.length === 0) throw Object.assign(new Error('Serviço não encontrado ou não elegível para disputa'), { status: 404 });

  // Mark service as disputed
  await pool.query(
    `UPDATE services SET status = 'disputed', updated_at = NOW() WHERE id = $1`,
    [serviceId]
  );

  const { rows } = await pool.query(
    `INSERT INTO disputes (service_id, opened_by, description, photo_urls)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [serviceId, userId, description, photoUrls || []]
  );
  return rows[0];
}

async function respondToDispute(disputeId, userId, { description, photoUrls }) {
  const { rows: dispute } = await pool.query(
    `SELECT d.*, s.requester_id, s.provider_id FROM disputes d
     JOIN services s ON s.id = d.service_id
     WHERE d.id = $1 AND d.status = 'open'`,
    [disputeId]
  );
  if (dispute.length === 0) throw Object.assign(new Error('Disputa não encontrada'), { status: 404 });
  const d = dispute[0];

  // Only the OTHER party can respond
  if (d.opened_by === userId) throw Object.assign(new Error('Você abriu esta disputa'), { status: 400 });
  if (d.requester_id !== userId && d.provider_id !== userId) {
    throw Object.assign(new Error('Sem permissão'), { status: 403 });
  }

  const { rows } = await pool.query(
    `UPDATE disputes SET response_description = $1, response_photo_urls = $2, status = 'responded'
     WHERE id = $3 RETURNING *`,
    [description, photoUrls || [], disputeId]
  );
  return rows[0];
}

async function resolveDispute(disputeId, adminUserId, { resolution, refundPercent }) {
  // In a real system this would be an admin-only action
  const { rows: dispute } = await pool.query(
    `SELECT d.*, s.payment_id, s.provider_id, s.requester_id FROM disputes d
     JOIN services s ON s.id = d.service_id
     WHERE d.id = $1`,
    [disputeId]
  );
  if (dispute.length === 0) throw Object.assign(new Error('Disputa não encontrada'), { status: 404 });
  const d = dispute[0];

  await pool.query(`UPDATE disputes SET status = 'resolved' WHERE id = $1`, [disputeId]);

  if (d.payment_id) {
    const { rows: pay } = await pool.query('SELECT * FROM payments WHERE id = $1', [d.payment_id]);
    if (pay.length > 0 && pay[0].status === 'held') {
      if (refundPercent >= 100) {
        await pagarme.refundPayment(pay[0].pagarme_transaction_id);
        await pool.query(`UPDATE payments SET status = 'refunded' WHERE id = $1`, [d.payment_id]);
        await pool.query(`UPDATE services SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [d.service_id]);
      } else if (refundPercent > 0) {
        const refundAmount = (pay[0].amount_total * refundPercent) / 100;
        await pagarme.refundPayment(pay[0].pagarme_transaction_id, refundAmount);
        await pagarme.releasePayment(pay[0].pagarme_transaction_id, pay[0].amount_service - refundAmount);
        await pool.query(`UPDATE payments SET status = 'partially_refunded' WHERE id = $1`, [d.payment_id]);
        await pool.query(`UPDATE services SET status = 'closed', updated_at = NOW() WHERE id = $1`, [d.service_id]);
      } else {
        await pagarme.releasePayment(pay[0].pagarme_transaction_id, pay[0].amount_service);
        await pool.query(`UPDATE payments SET status = 'released', released_at = NOW() WHERE id = $1`, [d.payment_id]);
        await pool.query(`UPDATE services SET status = 'confirmed', updated_at = NOW() WHERE id = $1`, [d.service_id]);
      }
    }
  }

  return { disputeId, resolution, refundPercent };
}

async function getDispute(disputeId, userId) {
  const { rows } = await pool.query(
    `SELECT d.* FROM disputes d
     JOIN services s ON s.id = d.service_id
     WHERE d.id = $1 AND (s.requester_id = $2 OR s.provider_id = $2)`,
    [disputeId, userId]
  );
  if (rows.length === 0) throw Object.assign(new Error('Disputa não encontrada'), { status: 404 });
  return rows[0];
}

module.exports = { openDispute, respondToDispute, resolveDispute, getDispute };
