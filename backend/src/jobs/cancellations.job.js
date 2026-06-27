const cron = require('node-cron');
const { pool } = require('../config/database');

/**
 * Runs daily at 5am.
 * Recalculates cancellation_count_30d for all providers.
 * Applies visibility penalty if a provider has >= 3 cancellations in 30 days.
 */
function startCancellationsJob() {
  cron.schedule('0 5 * * *', async () => {
    try {
      // Get all providers
      const { rows: providers } = await pool.query(
        `SELECT id FROM users WHERE is_provider = true`
      );

      for (const provider of providers) {
        try {
          // Count provider-caused cancellations in last 30 days
          const { rows: countRows } = await pool.query(
            `SELECT COUNT(*)::int AS cancel_count FROM services
             WHERE provider_id = $1
               AND cancelled_by = 'provider'
               AND updated_at >= NOW() - INTERVAL '30 days'`,
            [provider.id]
          );
          const cancelCount = countRows[0].cancel_count;

          // Update cancellation count
          await pool.query(
            `UPDATE users SET cancellation_count_30d = $1 WHERE id = $2`,
            [cancelCount, provider.id]
          );

          // Apply visibility penalty if >= 3 cancellations and no active penalty
          if (cancelCount >= 3) {
            const { rows: provRows } = await pool.query(
              `SELECT visibility_reduced_until FROM users WHERE id = $1`,
              [provider.id]
            );
            const hasActivePenalty = provRows[0]?.visibility_reduced_until &&
              new Date(provRows[0].visibility_reduced_until) > new Date();

            if (!hasActivePenalty) {
              const reducedUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
              await pool.query(
                `UPDATE users SET visibility_reduced_until = $1, updated_at = NOW() WHERE id = $2`,
                [reducedUntil, provider.id]
              );
              console.log(`[Job:cancellations] Applied 15d visibility penalty to provider ${provider.id} (${cancelCount} cancellations in 30d)`);
            }
          }
        } catch (innerErr) {
          console.error(`[Job:cancellations] Error processing provider ${provider.id}:`, innerErr.message);
        }
      }

      console.log(`[Job:cancellations] Processed ${providers.length} provider(s)`);
    } catch (err) {
      console.error('[Job:cancellations] Error:', err.message);
    }
  });
  console.log('[Job:cancellations] Scheduled (daily at 05:00)');
}

module.exports = { startCancellationsJob };
