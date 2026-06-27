const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

async function getProfile(userId) {
  const { rows } = await pool.query(
    `SELECT id, name, email, photo_url, neighborhood, bio, is_provider, provider_profile,
            rating_avg, rating_count, cancellation_count_30d, visibility_reduced_until, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  if (rows.length === 0) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 });
  return rows[0];
}

async function updateProfile(userId, fields) {
  const allowed = ['name', 'neighborhood', 'bio', 'photo_url', 'is_provider', 'provider_profile'];
  const updates = [];
  const values = [];
  let idx = 1;
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${idx++}`);
      values.push(key === 'provider_profile' && fields[key] ? JSON.stringify(fields[key]) : fields[key]);
    }
  }
  if (updates.length === 0) throw Object.assign(new Error('Nenhum campo para atualizar'), { status: 400 });
  updates.push(`updated_at = NOW()`);
  values.push(userId);
  const { rows } = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
     RETURNING id, name, email, photo_url, neighborhood, bio, is_provider, provider_profile, rating_avg, rating_count`,
    values
  );
  return rows[0];
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  if (rows.length === 0) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 });
  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) throw Object.assign(new Error('Senha atual incorreta'), { status: 401 });
  const password_hash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [password_hash, userId]);
}

async function getUserServices(userId) {
  const { rows } = await pool.query(
    `SELECT s.*,
            r.name AS requester_name, r.photo_url AS requester_photo,
            p.name AS provider_name, p.photo_url AS provider_photo
     FROM services s
     JOIN users r ON r.id = s.requester_id
     JOIN users p ON p.id = s.provider_id
     WHERE s.requester_id = $1 OR s.provider_id = $1
     ORDER BY s.created_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = { getProfile, updateProfile, changePassword, getUserServices };
