const cron = require('node-cron');
const { pool } = require('../config/database');

/**
 * Runs daily at 03:00.
 * Removes review placeholders that were never filled and whose window has expired.
 * Also makes both reviews visible once both are submitted (catch-up for any missed triggers).
 */
function startExpireReviewsJob() {
  cron.schedule('0 3 * * *', async () => {
    try {
      // Delete unfilled review placeholders past expiry
      const { rowCount: deleted } = await pool.query(
        `DELETE FROM reviews WHERE rating = 0 AND expires_at <= NOW()`
      );
      if (deleted > 0) {
        console.log(`[Job:expireReviews] Deleted ${deleted} expired empty review(s)`);
      }

      // Make reviews visible for services where both sides have rated
      const { rows: servicesToReveal } = await pool.query(
        `SELECT service_id FROM reviews WHERE rating > 0 AND is_visible = false
         GROUP BY service_id HAVING COUNT(*) >= 2`
      );
      for (const { service_id } of servicesToReveal) {
        await pool.query(`UPDATE reviews SET is_visible = true WHERE service_id = $1`, [service_id]);
        // Recompute rating averages for both parties
        const { rows: parties } = await pool.query(
          `SELECT DISTINCT reviewee_id FROM reviews WHERE service_id = $1`, [service_id]
        );
        for (const { reviewee_id } of parties) {
          await pool.query(
            `UPDATE users SET
               rating_avg = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = $1 AND is_visible = true AND rating > 0),
               rating_count = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1 AND is_visible = true AND rating > 0)
             WHERE id = $1`,
            [reviewee_id]
          );
        }
        console.log(`[Job:expireReviews] Revealed reviews for service ${service_id}`);
      }
    } catch (err) {
      console.error('[Job:expireReviews] Error:', err.message);
    }
  });
  console.log('[Job:expireReviews] Scheduled (daily at 03:00)');
}

module.exports = { startExpireReviewsJob };
