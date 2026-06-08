const express = require('express');
const pool = require('../db/conPool');
const router = express.Router();

// Helper function to validate URLs
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

// GET /monitors - Retrieve all monitors
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


// POST /monitors - Create a new monitor
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

//GET /monitors/:id - Retrieve a specific monitor by ID

router.get('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({error: {message: 'Invalid monitor ID.'}});
        }
        const result = await pool.query(
            'SELECT * FROM monitors WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({error: {message: 'Monitor not found.'}});
        }
        res.json({
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
});

// GET /monitors/:id/history - Retrieve monitoring Ping history for a specific monitor
router.get('/:id/history', async (req, res, next) => {
    try {

        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({error: {message: 'Monitor id is Invalid. It must be a number.'}});
        }
        const limit = Math.min(parseInt(req.query.limit) || 24, 200);

        const monitorResult = await pool.query(
            'SELECT * FROM monitors WHERE id = $1',
            [id]
        );
        if (monitorResult.rows.length === 0) {
            return res.status(404).json({error: {message: `Monitor with id ${id} not found.`}});
        }
        const historyResult = await pool.query(
            `SELECT id,status,status_code,latency_ms,error_message,checked_at FROM ping_logs WHERE monitor_id = $1 ORDER BY checked_at DESC LIMIT $2`,
            [id, limit]
        );

//Calculate uptime percentage
        const totalPings = historyResult.rows.length;
        const successfulPings = historyResult.rows.filter(row => row.status === 'up').length;
        const uptimePercentage = totalPings > 0
            ? ((successfulPings / totalPings) * 100).toFixed(2)
            : null;

        res.json({
            monitor: monitorResult.rows[0],
            history: historyResult.rows,
            summary: {
                total_pings: totalPings,
                successful_pings: successfulPings,
                downtime_pings: totalPings - successfulPings,
                uptime_percentage: uptimePercentage,
            },
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;