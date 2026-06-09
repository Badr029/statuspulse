const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('[worker] connected to PostgreSQL');
});

pool.on('error', (err) => {
    console.error('[worker] PostgreSQL pool error:', err.message);
});

module.exports = pool;