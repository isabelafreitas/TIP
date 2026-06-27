const cron = require('node-cron');
const { pool } = require('../config/database');

/**
 * Runs daily at 2am.
 * Makes reviews visible when their expiry time has passed (even if only one party reviewed).
 * Recalculates rating_avg and rating_count for affected users.
 */
function startReviewsJob() {
  cron.schedule('0 2 * * *', async () => {
    try {
      // Find reviews that expired while still invisible
      const { rows: expiredReviews } = await pool.query(
        `SELECT id, reviewee_id FROM reviews WHERE expires_at <= NOW() AND is_visible = false`
      );

      if (expiredReviews.length === 0) return;

      // Make them visible
      await pool.query(
        `UPDATE reviews SET is_visible = true WHERE expires_at <= NOW() AND is_visible = false`
      );

      // Recalculate ratings for all affected reviewees
      const revieweeIds = [...new Set(expiredReviews.map(r => r.reviewee_id))];
      for (const revieweeId of revieweeIds) {
        const { rows } = await pool.query(
          `SELECT AVG(rating)::numeric(3,2) AS avg, COUNT(*)::int AS cnt
           FROM reviews WHERE reviewee_id = $1 AND is_visible = true`,
          [revieweeId]
        );
        await pool.query(
          `UPDATE users SET rating_avg = $1, rating_count = $2, updated_at = NOW() WHERE id = $3`,
          [rows[0].avg || null, rows[0].cnt, revieweeId]
        );
      }

      console.log(`[Job:reviews] Made ${expiredReviews.length} review(s) visible, updated ${revieweeIds.length} user rating(s)`);
    } catch (err) {
      console.error('[Job:reviews] Error:', err.message);
    }
  });
  console.log('[Job:reviews] Scheduled (daily at 02:00)');
}

module.exports = { startReviewsJob };
