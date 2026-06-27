const { pool } = require('../config/database');

async function getSessions(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT cs.id, cs.service_id, cs.created_at,
              s.status AS service_status,
              r.id AS requester_id, r.name AS requester_name, r.photo_url AS requester_photo,
              p.id AS provider_id, p.name AS provider_name, p.photo_url AS provider_photo,
              (SELECT content FROM messages m WHERE m.session_id = cs.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
              (SELECT created_at FROM messages m WHERE m.session_id = cs.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at
       FROM chat_sessions cs
       JOIN services s ON s.id = cs.service_id
       JOIN users r ON r.id = s.requester_id
       JOIN users p ON p.id = s.provider_id
       WHERE s.requester_id = $1 OR s.provider_id = $1
       ORDER BY last_message_at DESC NULLS LAST`,
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function getMessages(req, res) {
  try {
    const { id } = req.params;
    const { before } = req.query; // cursor pagination
    const limit = 50;

    // Verify access
    const { rows: sessionRows } = await pool.query(
      `SELECT cs.*, s.requester_id, s.provider_id
       FROM chat_sessions cs JOIN services s ON s.id = cs.service_id
       WHERE cs.id = $1`,
      [id]
    );
    if (sessionRows.length === 0) return res.status(404).json({ success: false, error: 'Sessão não encontrada' });
    const session = sessionRows[0];
    if (session.requester_id !== req.user.id && session.provider_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }

    let query;
    let values;
    if (before) {
      // Get the created_at of the cursor message
      const { rows: cursorRows } = await pool.query(`SELECT created_at FROM messages WHERE id = $1`, [before]);
      if (cursorRows.length === 0) return res.status(400).json({ success: false, error: 'Cursor inválido' });
      query = `
        SELECT m.*, u.name AS sender_name, u.photo_url AS sender_photo
        FROM messages m JOIN users u ON u.id = m.sender_id
        WHERE m.session_id = $1 AND m.created_at < $2
        ORDER BY m.created_at DESC LIMIT $3
      `;
      values = [id, cursorRows[0].created_at, limit];
    } else {
      query = `
        SELECT m.*, u.name AS sender_name, u.photo_url AS sender_photo
        FROM messages m JOIN users u ON u.id = m.sender_id
        WHERE m.session_id = $1
        ORDER BY m.created_at DESC LIMIT $2
      `;
      values = [id, limit];
    }

    const { rows } = await pool.query(query, values);
    return res.json({ success: true, data: rows.reverse() });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

async function sendMessage(req, res) {
  try {
    const { id } = req.params;
    const { content, type = 'text' } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Conteúdo é obrigatório' });
    }

    // Verify access
    const { rows: sessionRows } = await pool.query(
      `SELECT cs.*, s.requester_id, s.provider_id
       FROM chat_sessions cs JOIN services s ON s.id = cs.service_id
       WHERE cs.id = $1`,
      [id]
    );
    if (sessionRows.length === 0) return res.status(404).json({ success: false, error: 'Sessão não encontrada' });
    const session = sessionRows[0];
    if (session.requester_id !== req.user.id && session.provider_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }

    const { rows } = await pool.query(
      `INSERT INTO messages (session_id, sender_id, type, content) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, req.user.id, type, content]
    );
    const message = rows[0];

    // Broadcast via WebSocket if available
    const wsModule = req.app.locals.chatWs;
    if (wsModule && wsModule.broadcastToSession) {
      wsModule.broadcastToSession(id, { type: 'new_message', data: message });
    }

    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

module.exports = { getSessions, getMessages, sendMessage };
