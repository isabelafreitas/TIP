const cron = require('node-cron');
const { pool } = require('../config/database');

/**
 * Runs daily at 00:05.
 * Resets cancellation_count_30d for providers whose last cancellation was more than 30 days ago,
 * and lifts visibility penalties that have expired.
 */
function startResetCancellationCountsJob() {
  cron.schedule('5 0 * * *', async () => {
    try {
      // Lift expired visibility penalties
      const { rowCount: lifted } = await pool.query(
        `UPDATE users SET visibility_reduced_until = NULL
         WHERE visibility_reduced_until IS NOT NULL AND visibility_reduced_until <= NOW()`
      );
      if (lifted > 0) {
        console.log(`[Job:resetCancellationCounts] Lifted visibility penalty for ${lifted} provider(s)`);
      }

      // Reset cancellation counts for providers with no cancellation in last 30 days
      const { rowCount: reset } = await pool.query(
        `UPDATE users SET cancellation_count_30d = 0
         WHERE is_provider = true
           AND cancellation_count_30d > 0
           AND id NOT IN (
             SELECT DISTINCT provider_id FROM services
             WHERE cancelled_by = 'provider'
               AND updated_at >= NOW() - INTERVAL '30 days'
           )`
      );
      if (reset > 0) {
        console.log(`[Job:resetCancellationCounts] Reset cancellation count for ${reset} provider(s)`);
      }
    } catch (err) {
      console.error('[Job:resetCancellationCounts] Error:', err.message);
    }
  });
  console.log('[Job:resetCancellationCounts] Scheduled (daily at 00:05)');
}

module.exports = { startResetCancellationCountsJob };
