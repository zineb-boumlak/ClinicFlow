const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';

  
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Corps de requête JSON invalide';
  }

  
  switch (err.code) {
    case '22P02': 
    case '22007': 
    case '22008': 
      statusCode = 400;
      message = 'Données invalides';
      break;
    case '23503': 
      statusCode = 400;
      message = 'Référence invalide';
      break;
    case '23505': 
      statusCode = 409;
      message = 'Cette valeur existe déjà';
      break;
    default:
      break;
  }

  if (statusCode >= 500) {
    console.error(err);
    if (env.nodeEnv !== 'development') {
      message = 'Erreur interne du serveur';
    }
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
  });
};

module.exports = errorHandler;