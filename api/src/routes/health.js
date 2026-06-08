const express = require('express'); //get the express module
const pool = require('../db/conPool'); //get the connection pool

const router = express.Router(); 

router.get('/', async (req, res, next) => {

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

});

module.exports = router;