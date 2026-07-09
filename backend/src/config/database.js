const { Pool } = require('pg');
require('dotenv').config();
const logger = require('./logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

pool.connect((err, client, release) => {
  if (err) {
    logger.error(`DB connection failed: ${err.message}`);
    return;
  }
  logger.info('[+] DB connected');
  release();
});

module.exports = pool;
