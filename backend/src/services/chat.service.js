const { pool } = require('../config/database');

async function getOrCreateSession(serviceId, userId) {
  // Verify user is a party to the service
  const { rows: svc } = await pool.query(
    `SELECT id FROM services WHERE id = $1 AND (requester_id = $2 OR provider_id = $2)`,
    [serviceId, userId]
  );
  if (svc.length === 0) throw Object.assign(new Error('Serviço não encontrado'), { status: 404 });

  let { rows } = await pool.query(`SELECT * FROM chat_sessions WHERE service_id = $1`, [serviceId]);
  if (rows.length === 0) {
    const ins = await pool.query(
      `INSERT INTO chat_sessions (service_id) VALUES ($1) RETURNING *`,
      [serviceId]
    );
    rows = ins.rows;
  }
  return rows[0];
}

async function getMessages(sessionId, userId, { page = 1, limit = 50 } = {}) {
  // Verify user can access this session
  const { rows: sess } = await pool.query(
    `SELECT cs.* FROM chat_sessions cs
     JOIN services s ON s.id = cs.service_id
     WHERE cs.id = $1 AND (s.requester_id = $2 OR s.provider_id = $2)`,
    [sessionId, userId]
  );
  if (sess.length === 0) throw Object.assign(new Error('Sessão não encontrada'), { status: 404 });

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { rows } = await pool.query(
    `SELECT m.*, u.name AS sender_name, u.photo_url AS sender_photo
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.session_id = $1
     ORDER BY m.created_at DESC
     LIMIT $2 OFFSET $3`,
    [sessionId, parseInt(limit), offset]
  );
  return rows.reverse();
}

async function sendMessage(sessionId, senderId, { type, content, metadata }) {
  // Verify sender can access this session
  const { rows: sess } = await pool.query(
    `SELECT cs.* FROM chat_sessions cs
     JOIN services s ON s.id = cs.service_id
     WHERE cs.id = $1 AND (s.requester_id = $2 OR s.provider_id = $2)`,
    [sessionId, senderId]
  );
  if (sess.length === 0) throw Object.assign(new Error('Sessão não encontrada'), { status: 404 });

  const { rows } = await pool.query(
    `INSERT INTO messages (session_id, sender_id, type, content, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [sessionId, senderId, type || 'text', content, metadata ? JSON.stringify(metadata) : null]
  );
  return rows[0];
}

module.exports = { getOrCreateSession, getMessages, sendMessage };
