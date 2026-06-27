const cron = require('node-cron');
const { pool } = require('../config/database');

/**
 * Runs daily at 3am.
 * Marks active announcements as 'expired' when their expires_at has passed.
 */
function startAnnouncementsJob() {
  cron.schedule('0 3 * * *', async () => {
    try {
      const { rowCount } = await pool.query(
        `UPDATE announcements SET status = 'expired'
         WHERE status = 'active' AND expires_at <= NOW()`
      );
      if (rowCount > 0) {
        console.log(`[Job:announcements] Expired ${rowCount} announcement(s)`);
      }
    } catch (err) {
      console.error('[Job:announcements] Error:', err.message);
    }
  });
  console.log('[Job:announcements] Scheduled (daily at 03:00)');
}

module.exports = { startAnnouncementsJob };
