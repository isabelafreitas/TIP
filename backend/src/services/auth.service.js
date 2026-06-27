const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { sign, signRefresh, verifyRefresh } = require('../config/jwt');

const SALT_ROUNDS = 12;

async function register({ name, email, password, neighborhood, bio, isProvider, providerProfile }) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw Object.assign(new Error('E-mail já cadastrado'), { status: 409 });
  }
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, neighborhood, bio, is_provider, provider_profile)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, neighborhood, bio, is_provider, provider_profile, created_at`,
    [name, email, password_hash, neighborhood || null, bio || null,
     isProvider || false, providerProfile ? JSON.stringify(providerProfile) : null]
  );
  const user = rows[0];
  const accessToken = sign({ id: user.id, email: user.email });
  const refreshToken = signRefresh({ id: user.id, email: user.email });
  return { user, accessToken, refreshToken };
}

async function login({ email, password }) {
  const { rows } = await pool.query(
    'SELECT id, name, email, password_hash, is_provider, photo_url, neighborhood FROM users WHERE email = $1',
    [email]
  );
  if (rows.length === 0) {
    throw Object.assign(new Error('Credenciais inválidas'), { status: 401 });
  }
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Credenciais inválidas'), { status: 401 });
  }
  delete user.password_hash;
  const accessToken = sign({ id: user.id, email: user.email });
  const refreshToken = signRefresh({ id: user.id, email: user.email });
  return { user, accessToken, refreshToken };
}

async function refresh(token) {
  let decoded;
  try {
    decoded = verifyRefresh(token);
  } catch {
    throw Object.assign(new Error('Refresh token inválido'), { status: 401 });
  }
  const accessToken = sign({ id: decoded.id, email: decoded.email });
  const refreshToken = signRefresh({ id: decoded.id, email: decoded.email });
  return { accessToken, refreshToken };
}

module.exports = { register, login, refresh };
