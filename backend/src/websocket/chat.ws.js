const WebSocket = require('ws');
const { verify } = require('../config/jwt');
const { pool } = require('../config/database');

/**
 * Map of sessionId -> Set of WebSocket clients
 */
const sessionClients = new Map();

function broadcastToSession(sessionId, data) {
  const clients = sessionClients.get(sessionId);
  if (!clients) return;
  const message = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

/**
 * Attach WebSocket server to the HTTP server.
 * Connection URL: ws://host/ws?token=JWT&sessionId=SESSION_ID
 * @param {import('http').Server} server
 * @returns {{ broadcastToSession: Function }}
 */
function attachWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const sessionId = url.searchParams.get('sessionId');

    if (!token || !sessionId) {
      ws.close(4001, 'Token e sessionId são obrigatórios');
      return;
    }

    let userId;
    try {
      const decoded = verify(token);
      userId = decoded.id;
    } catch {
      ws.close(4001, 'Token inválido');
      return;
    }

    // Verify user has access to this session
    try {
      const { rows } = await pool.query(
        `SELECT cs.id FROM chat_sessions cs
         JOIN services s ON s.id = cs.service_id
         WHERE cs.id = $1 AND (s.requester_id = $2 OR s.provider_id = $2)`,
        [sessionId, userId]
      );
      if (rows.length === 0) {
        ws.close(4003, 'Acesso negado à sessão');
        return;
      }
    } catch (err) {
      ws.close(4000, 'Erro de verificação');
      return;
    }

    // Register client
    if (!sessionClients.has(sessionId)) {
      sessionClients.set(sessionId, new Set());
    }
    sessionClients.get(sessionId).add(ws);
    ws._userId = userId;
    ws._sessionId = sessionId;

    console.log(`[WS] User ${userId} connected to session ${sessionId}`);

    // Ping/pong keepalive
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (raw) => {
      let payload;
      try {
        payload = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'JSON inválido' }));
        return;
      }

      if (payload.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      if (payload.type === 'send_message') {
        const { content, messageType } = payload;
        if (!content) {
          ws.send(JSON.stringify({ type: 'error', error: 'Conteúdo é obrigatório' }));
          return;
        }
        try {
          const { rows } = await pool.query(
            `INSERT INTO messages (session_id, sender_id, type, content)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [sessionId, userId, messageType || 'text', content]
          );
          const message = rows[0];
          broadcastToSession(sessionId, { type: 'new_message', data: message });
        } catch (err) {
          ws.send(JSON.stringify({ type: 'error', error: err.message }));
        }
        return;
      }
    });

    ws.on('close', () => {
      const clients = sessionClients.get(sessionId);
      if (clients) {
        clients.delete(ws);
        if (clients.size === 0) sessionClients.delete(sessionId);
      }
      console.log(`[WS] User ${userId} disconnected from session ${sessionId}`);
    });

    ws.on('error', (err) => {
      console.error(`[WS] Socket error for user ${userId}:`, err.message);
    });

    ws.send(JSON.stringify({ type: 'connected', sessionId, userId }));
  });

  // Keepalive interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) { ws.terminate(); return; }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  wss.broadcastToSession = broadcastToSession;

  console.log('[WS] WebSocket server ready at /ws');
  return { broadcastToSession };
}

module.exports = { attachWebSocket, broadcastToSession };
