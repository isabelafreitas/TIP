const WebSocket = require('ws');
const { verify } = require('../config/jwt');
const chatService = require('../services/chat.service');

/**
 * Map of sessionId -> Set of WebSocket clients
 * Used to broadcast messages to all participants in a chat session.
 */
const sessionClients = new Map();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    // Authenticate via query string token: /ws?token=<jwt>
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

    // Verify user can access this session
    try {
      await chatService.getMessages(sessionId, userId, { page: 1, limit: 1 });
    } catch {
      ws.close(4003, 'Acesso negado à sessão');
      return;
    }

    // Register client in session
    if (!sessionClients.has(sessionId)) {
      sessionClients.set(sessionId, new Set());
    }
    sessionClients.get(sessionId).add(ws);
    ws._userId = userId;
    ws._sessionId = sessionId;

    console.log(`[WS] User ${userId} connected to session ${sessionId}`);

    ws.on('message', async (raw) => {
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'JSON inválido' }));
        return;
      }

      if (payload.type === 'send_message') {
        const { content, messageType, metadata } = payload;
        if (!content) {
          ws.send(JSON.stringify({ type: 'error', error: 'Conteúdo é obrigatório' }));
          return;
        }
        try {
          const message = await chatService.sendMessage(sessionId, userId, {
            type: messageType || 'text',
            content,
            metadata,
          });
          // Broadcast to all clients in this session
          broadcastToSession(sessionId, { type: 'new_message', data: message });
        } catch (err) {
          ws.send(JSON.stringify({ type: 'error', error: err.message }));
        }
      } else if (payload.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
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
      console.error(`[WS] Error for user ${userId}:`, err.message);
    });

    // Send confirmation
    ws.send(JSON.stringify({ type: 'connected', sessionId, userId }));
  });

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

  // Attach broadcastToSession to wss for use from REST endpoints
  wss.broadcastToSession = broadcastToSession;

  console.log('[WS] WebSocket server ready at /ws');
  return wss;
}

module.exports = { setupWebSocket };
