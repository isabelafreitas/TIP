const cron = require('node-cron');
const { pool } = require('../config/database');
const pagarme = require('../services/pagarme.service');

/**
 * Runs every 10 minutes.
 * Auto-releases payments held in escrow when the 48h window after
 * provider marks completion has passed with no dispute.
 */
function startAutoReleasePaymentsJob() {
  cron.schedule('*/10 * * * *', async () => {
    try {
      const { rows } = await pool.query(
        `SELECT p.id, p.service_id, p.pagarme_transaction_id, p.amount_service
         FROM payments p
         JOIN services s ON s.id = p.service_id
         WHERE p.status = 'held'
           AND p.auto_release_at IS NOT NULL
           AND p.auto_release_at <= NOW()
           AND s.status = 'completed_by_provider'`
      );

      for (const payment of rows) {
        try {
          await pagarme.releasePayment(payment.pagarme_transaction_id, payment.amount_service);
          await pool.query(
            `UPDATE payments SET status = 'released', released_at = NOW() WHERE id = $1`,
            [payment.id]
          );
          await pool.query(
            `UPDATE services SET status = 'confirmed', updated_at = NOW() WHERE id = $1`,
            [payment.service_id]
          );
          console.log(`[Job:autoReleasePayments] Released payment ${payment.id} for service ${payment.service_id}`);
        } catch (releaseErr) {
          console.error(`[Job:autoReleasePayments] Failed to release payment ${payment.id}:`, releaseErr.message);
        }
      }
    } catch (err) {
      console.error('[Job:autoReleasePayments] Error:', err.message);
    }
  });
  console.log('[Job:autoReleasePayments] Scheduled (every 10 min)');
}

module.exports = { startAutoReleasePaymentsJob };
