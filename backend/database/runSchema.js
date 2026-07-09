const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const runSchema = async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('[+] Schema created successfully');
  } catch (err) {
    console.error('[-] Schema creation failed:', err.message);
  } finally {
    await pool.end();
  }
};

runSchema();
