const cron = require('node-cron');
const { pool } = require('../config/database');

/**
 * Runs every 15 minutes.
 * Marks announcements as 'expired' when their expires_at has passed.
 */
function startExpireAnnouncementsJob() {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const { rowCount } = await pool.query(
        `UPDATE announcements SET status = 'expired'
         WHERE status = 'active' AND expires_at <= NOW()`
      );
      if (rowCount > 0) {
        console.log(`[Job:expireAnnouncements] Expired ${rowCount} announcement(s)`);
      }
    } catch (err) {
      console.error('[Job:expireAnnouncements] Error:', err.message);
    }
  });
  console.log('[Job:expireAnnouncements] Scheduled (every 15 min)');
}

module.exports = { startExpireAnnouncementsJob };
