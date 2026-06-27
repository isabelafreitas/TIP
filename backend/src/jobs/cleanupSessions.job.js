const cron = require('node-cron');
const { pool } = require('../config/database');

/**
 * Runs weekly on Sunday at 04:00.
 * Cleans up chat messages older than 90 days for completed/cancelled services.
 */
function startCleanupSessionsJob() {
  cron.schedule('0 4 * * 0', async () => {
    try {
      const { rowCount } = await pool.query(
        `DELETE FROM messages
         WHERE created_at < NOW() - INTERVAL '90 days'
           AND session_id IN (
             SELECT cs.id FROM chat_sessions cs
             JOIN services s ON s.id = cs.service_id
             WHERE s.status IN ('confirmed', 'cancelled', 'closed')
           )`
      );
      if (rowCount > 0) {
        console.log(`[Job:cleanupSessions] Deleted ${rowCount} old message(s)`);
      }
    } catch (err) {
      console.error('[Job:cleanupSessions] Error:', err.message);
    }
  });
  console.log('[Job:cleanupSessions] Scheduled (weekly Sunday 04:00)');
}

module.exports = { startCleanupSessionsJob };
