const { Pool } = require('pg');
require('dotenv').config();
const log = require('./logger');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err) => {
  if (err) {
    log.error(`DB connection failed: ${err.message}`);
    process.exit(1);
  }
  log.info('DB connected');
});

module.exports = pool;
