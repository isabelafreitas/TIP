const cron = require('node-cron');
const { pool } = require('../config/database');
const pagarmeService = require('../services/pagarme.service');
const notificationService = require('../services/notification.service');

/**
 * Runs every 15 minutes.
 * Auto-releases payments when auto_release_at has passed and service is not disputed.
 */
function startEscrowJob() {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const { rows } = await pool.query(
        `SELECT p.id AS payment_id, p.pagarme_transaction_id, p.amount_service, p.service_id,
                s.id AS service_id, s.provider_id, s.requester_id
         FROM payments p
         JOIN services s ON s.id = p.service_id
         WHERE p.status = 'held'
           AND p.auto_release_at IS NOT NULL
           AND p.auto_release_at <= NOW()
           AND s.status != 'disputed'`
      );

      for (const row of rows) {
        try {
          await pagarmeService.releasePayment(row.pagarme_transaction_id, row.amount_service);
          await pool.query(
            `UPDATE payments SET status = 'released', released_at = NOW(), auto_release_at = NULL WHERE id = $1`,
            [row.payment_id]
          );
          await pool.query(
            `UPDATE services SET status = 'confirmed', updated_at = NOW() WHERE id = $1`,
            [row.service_id]
          );

          await notificationService.sendPush(
            row.provider_id,
            'Pagamento liberado',
            'O prazo expirou e o pagamento foi liberado automaticamente.',
            { service_id: row.service_id }
          );
          await notificationService.sendPush(
            row.requester_id,
            'Serviço confirmado automaticamente',
            'O serviço foi confirmado automaticamente após 24 horas.',
            { service_id: row.service_id }
          );

          console.log(`[Job:escrow] Released payment ${row.payment_id} for service ${row.service_id}`);
        } catch (innerErr) {
          console.error(`[Job:escrow] Failed to release payment ${row.payment_id}:`, innerErr.message);
        }
      }
    } catch (err) {
      console.error('[Job:escrow] Error:', err.message);
    }
  });
  console.log('[Job:escrow] Scheduled (every 15 min)');
}

module.exports = { startEscrowJob };
