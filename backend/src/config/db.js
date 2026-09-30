const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};