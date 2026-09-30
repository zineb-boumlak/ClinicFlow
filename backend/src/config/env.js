const dotenv = require('dotenv');
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const DEV_SECRET = 'dev_only_secret_change_me';

if (nodeEnv === 'production') {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret.includes('change_me')) {
    throw new Error(
      'JWT_SECRET est obligatoire en production (32 caractères minimum, valeur aléatoire). ' +
        'Générez-en un avec : openssl rand -hex 32'
    );
  }
}

module.exports = {
  nodeEnv,
  port: Number(process.env.PORT) || 4000,
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://clinicflow:clinicflow@localhost:5432/clinicflow',
  jwtSecret: process.env.JWT_SECRET || DEV_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  corsOrigin:
    process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173',
};