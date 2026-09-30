const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');

const COLUMNS = `id, full_name AS "fullName", email, role, created_at AS "createdAt"`;

const handleDbError = (err) => {
  if (err.code === '23505') throw new AppError('Cet email est déjà utilisé', 409);
  throw err;
};

const getAll = async () => {
  const res = await db.query(`SELECT ${COLUMNS} FROM users ORDER BY created_at DESC`);
  return res.rows;
};

const create = async ({ fullName, email, password, role }) => {
  const hash = await bcrypt.hash(password, env.bcryptRounds);
  try {
    const res = await db.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [fullName, email, hash, role]
    );
    return res.rows[0];
  } catch (err) {
    return handleDbError(err);
  }
};

const update = async (id, currentUserId, data) => {
  const existing = await db.query('SELECT id, role FROM users WHERE id = $1', [id]);
  if (existing.rows.length === 0) throw new AppError('Utilisateur introuvable', 404);

  
  if (id === currentUserId && data.role && data.role !== 'admin') {
    throw new AppError('Vous ne pouvez pas modifier votre propre rôle', 400);
  }

  const fields = [];
  const params = [];
  const set = (column, value) => {
    params.push(value);
    fields.push(`${column} = $${params.length}`);
  };

  if (data.fullName !== undefined) set('full_name', data.fullName);
  if (data.email !== undefined) set('email', data.email);
  if (data.role !== undefined) set('role', data.role);
  if (data.password !== undefined) set('password', await bcrypt.hash(data.password, env.bcryptRounds));

  params.push(id);
  try {
    const res = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING ${COLUMNS}`,
      params
    );
    return res.rows[0];
  } catch (err) {
    return handleDbError(err);
  }
};

const remove = async (id, currentUserId) => {
  if (id === currentUserId) {
    throw new AppError('Vous ne pouvez pas supprimer votre propre compte', 400);
  }
  try {
    const res = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (res.rows.length === 0) throw new AppError('Utilisateur introuvable', 404);
  } catch (err) {
   
    if (err.code === '23503') {
      throw new AppError(
        'Impossible de supprimer : cet utilisateur a créé des rendez-vous',
        409
      );
    }
    throw err;
  }
};

module.exports = { getAll, create, update, remove };