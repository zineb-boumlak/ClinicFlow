const jwt = require('jsonwebtoken');
const env = require('../config/env');
const db = require('../config/db');
const AppError = require('../utils/AppError');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Non autorisé. Token manquant', 401));
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {

    decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch (err) {
    return next(new AppError('Token invalide ou expiré', 401));
  }

  try {

    const result = await db.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return next(new AppError('Utilisateur introuvable ou supprimé', 401));
    }
    req.user = result.rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;