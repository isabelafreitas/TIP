const cron = require('node-cron');
const { pool } = require('../config/database');
const notificationService = require('../services/notification.service');

/**
 * Runs daily at 4am.
 * Detects services completed by provider but not confirmed by requester within 24h
 * (i.e., non-attendance by requester or no-show by provider).
 * Records non-attendance and applies visibility penalties for repeat offenses.
 */
function startNonAttendanceJob() {
  cron.schedule('0 4 * * *', async () => {
    try {
      // Find services completed by provider > 24h ago with no dispute and no confirmation
      const { rows: services } = await pool.query(
        `SELECT s.id, s.provider_id, s.requester_id
         FROM services s
         WHERE s.status = 'completed_by_provider'
           AND s.updated_at <= NOW() - INTERVAL '24 hours'
           AND NOT EXISTS (SELECT 1 FROM disputes d WHERE d.service_id = s.id)
           AND NOT EXISTS (SELECT 1 FROM non_attendance_records nar WHERE nar.service_id = s.id)`
      );

      for (const service of services) {
        try {
          // Record non-attendance
          await pool.query(
            `INSERT INTO non_attendance_records (provider_id, service_id) VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [service.provider_id, service.id]
          );

          // Count offenses in last 60 days
          const { rows: offenseRows } = await pool.query(
            `SELECT COUNT(*)::int AS offense_count FROM non_attendance_records
             WHERE provider_id = $1 AND recorded_at >= NOW() - INTERVAL '60 days'`,
            [service.provider_id]
          );
          const offenseCount = offenseRows[0].offense_count;

          // Apply penalty on 2nd or 3rd offense
          if (offenseCount === 2 || offenseCount === 3) {
            const { rows: providerRows } = await pool.query(
              `SELECT visibility_reduced_until FROM users WHERE id = $1`,
              [service.provider_id]
            );
            const alreadyPenalized = providerRows[0]?.visibility_reduced_until &&
              new Date(providerRows[0].visibility_reduced_until) > new Date();

            if (!alreadyPenalized) {
              const penaltyDays = offenseCount === 2 ? 7 : 15;
              const reducedUntil = new Date(Date.now() + penaltyDays * 24 * 60 * 60 * 1000);
              await pool.query(
                `UPDATE users SET visibility_reduced_until = $1, updated_at = NOW() WHERE id = $2`,
                [reducedUntil, service.provider_id]
              );
              await notificationService.sendPush(
                service.provider_id,
                'Aviso: não comparecimento',
                `Sua visibilidade foi reduzida por ${penaltyDays} dias devido a não comparecimento.`,
                { service_id: service.id }
              );
              console.log(`[Job:nonattendance] Applied ${penaltyDays}d visibility penalty to provider ${service.provider_id} (offense #${offenseCount})`);
            }
          }

          // Auto-release payment and confirm service
          const { rows: svcRows } = await pool.query(`SELECT payment_id FROM services WHERE id = $1`, [service.id]);
          if (svcRows[0]?.payment_id) {
            await pool.query(
              `UPDATE payments SET status = 'released', released_at = NOW() WHERE id = $1 AND status = 'held'`,
              [svcRows[0].payment_id]
            );
          }
          await pool.query(
            `UPDATE services SET status = 'confirmed', updated_at = NOW() WHERE id = $1`,
            [service.id]
          );

          console.log(`[Job:nonattendance] Recorded non-attendance for service ${service.id}`);
        } catch (innerErr) {
          console.error(`[Job:nonattendance] Error processing service ${service.id}:`, innerErr.message);
        }
      }
    } catch (err) {
      console.error('[Job:nonattendance] Error:', err.message);
    }
  });
  console.log('[Job:nonattendance] Scheduled (daily at 04:00)');
}

module.exports = { startNonAttendanceJob };
