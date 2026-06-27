const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('Database connected successfully');
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };
