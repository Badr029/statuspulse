const {Pool} = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('connected to the database');
});
pool.on('error', (err) => {
    console.log('error connecting to the database', err.message);
});

module.exports = pool;