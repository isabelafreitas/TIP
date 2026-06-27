/**
 * Push notification service stub.
 * In production, replace with FCM / APNs / Expo Push calls.
 */

const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * Send a push notification to a user.
 * @param {string} userId - target user UUID
 * @param {string} title - notification title
 * @param {string} body - notification body text
 * @param {object} [data={}] - extra payload data
 */
async function sendPush(userId, title, body, data = {}) {
  console.log(`[NOTIFICATION STUB] sendPush userId=${userId} title="${title}" body="${body}"`, data);

  if (IS_DEV) {
    return { sent: true, stub: true };
  }

  // Production: FCM / Expo
  const userToken = await getUserPushToken(userId);
  if (!userToken) return { sent: false, reason: 'no_token' };

  const message = {
    to: userToken,
    title,
    body,
    data,
    sound: 'default',
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  return await response.json();
}

async function getUserPushToken(userId) {
  // In production, look up user push token from DB
  const { pool } = require('../config/database');
  const { rows } = await pool.query('SELECT push_token FROM users WHERE id = $1', [userId]);
  return rows[0]?.push_token || null;
}

/**
 * Send an in-app notification (system message in chat or notifications table).
 * Stub implementation — just logs.
 */
async function sendSystemMessage(sessionId, content, metadata = {}) {
  console.log(`[NOTIFICATION STUB] sendSystemMessage sessionId=${sessionId} content="${content}"`, metadata);
  return { sent: true, stub: true };
}

module.exports = { sendPush, sendSystemMessage };
