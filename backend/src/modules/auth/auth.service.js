const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');

const login = async (email, password) => {
  const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  const user = userResult.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
};

const getMe = async (userId) => {
  const userResult = await db.query('SELECT id, email, role, created_at FROM users WHERE id = $1', [userId]);
  if (userResult.rows.length === 0) {
    throw new AppError('Utilisateur introuvable', 404);
  }
  return userResult.rows[0];
};

module.exports = { login, getMe };