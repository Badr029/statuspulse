const pool = require('../config/db');
async function health(req, res, next) {

    try {
        await pool.query('SELECT 1');
        res.json({
            status: 'ok' ,
            timestamp: new Date().toISOString(),
            database: 'connected',
            });

    } catch (err) {
        next(err);
    }

}

module.exports = {health,};