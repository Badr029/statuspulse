const express = require('express');
const pool = require('../db/conPool');
const router = express.Router();

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM monitors ORDER BY created_at DESC'
        );
        res.json({
            data: result.rows,
            count: result.rowCount,
        });
    } catch (error) {
        next(error);
    }
});

// TODO:
// Decide duplicate monitor policy:
// - Allow duplicates?
// - Block exact duplicates?
// - Warn on duplicate URLs?

router.post('/', async (req, res, next) => {

    try {
        const {name, url, interval_seconds} = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({error: {message: 'Name is required and cannot be empty.'}});
        }

        if (!url || !isValidUrl(url)) {
            return res.status(400).json({error: {message: 'URL is required and must be a valid http|https URL.'}});
        }


        const interval = interval_seconds || 60;

        if (interval < 30 || interval > 3600) {
            return res.status(400).json({error: {message: 'Interval must be between 30 and 3600 seconds.'}});
        }

        const result = await pool.query(
            'INSERT INTO monitors (name, url, interval_seconds) VALUES ($1, $2, $3) RETURNING *',
            [name, url, interval]
        );
        res.status(201).json({
            
            message: 'Monitor created successfully.',
            data: result.rows[0],

            });

    } catch (error) {
        next(error);
    }
});


module.exports = router;