const { verify } = require('../config/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token de acesso necessário' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verify(token);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
  }
}

module.exports = authMiddleware;
