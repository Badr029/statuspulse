const express = require('express');
const pool = require('../db/conPool');
const router = express.Router();
const { sendEmailAlert } = require('../services/email');

// Helper function to validate URLs
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

// Middleware to fetch monitor by ID and attach to req object
async function getMonitorById(req, res, next) {
        try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({error: {message: 'Monitor id is Invalid. It must be a number.'}});
        }
        const result = await pool.query(
            'SELECT * FROM monitors WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({error: {message: `Monitor with id ${id} not found.`}});
        }
        req.monitor = result.rows[0];
        req.monitorId = id;
        next();
    } catch (error) {
        next(error);
    }

}


// GET /monitors - Retrieve all monitors
router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT m.*, latest.status AS last_status 
            FROM monitors m 
            LEFT JOIN LATERAL (
                SELECT status
                FROM ping_logs
                WHERE monitor_id = m.id
                ORDER BY checked_at DESC
                LIMIT 1
            ) latest ON true
            ORDER BY m.created_at DESC
            `
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

router.get('/:id', getMonitorById, async (req, res, next) => {
    res.json({
        data: req.monitor,
    });
});

// GET /monitors/:id/history - Retrieve monitoring Ping history for a specific monitor
router.get('/:id/history', getMonitorById, async (req, res, next) => {
    try {

        const id = req.monitorId;
        const limit = Math.min(parseInt(req.query.limit) || 24, 200);

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
            monitor: req.monitor,
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


//Delete a monitor

router.delete('/:id', getMonitorById,  async (req, res, next) => {
    try {
        const id = req.monitorId;

        const result = await pool.query(
        'DELETE FROM monitors WHERE id = $1 RETURNING *',
        [id]
        );

        res.json({
        message: 'monitor deleted',
        data: result.rows[0],
        });

    } catch (err) {
        next(err);
    }

});


//Update a monitor's name, url or interval_seconds.

router.patch('/:id', getMonitorById, async (req, res, next) => {
    try {
        const id = req.monitorId;
        const { name, url, interval_seconds } = req.body;

        if (url && !isValidUrl(url)) {
        return res.status(400).json({ error: { message: 'URL must be a valid http|https URL.' } });
        }

        if (interval_seconds && (interval_seconds < 30 || interval_seconds > 3600)) {
        return res.status(400).json({ error: { message: 'Interval must be between 30 and 3600 seconds.' } });
        }

        const fields = [];
        const values = [];  
        let i = 1;
        
        if (name){
            fields.push(`name = $${i++}`);
            values.push(name.trim());
        }

        if (url){
            fields.push(`url = $${i++}`);
            values.push(url.trim());
        }

        if (interval_seconds){
            fields.push(`interval_seconds = $${i++}`);
            values.push(interval_seconds);
        }
    
        if (fields.length === 0){
            return res.status(400).json({ error: { message: 'No fields to update' } });
        }

        values.push(id);

        const result = await pool.query(
        `UPDATE monitors SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
        values
        );

        res.json({
        message: 'monitor updated',
        data: result.rows[0],
        });

    } catch (err) {
        next(err);
    }

});


//Pause or Resume a Monitor check

router.patch('/:id/toggle', getMonitorById, async (req, res, next) => {
    try {
        const id = req.monitorId;
        const result = await pool.query(
        'UPDATE monitors SET is_active = NOT is_active WHERE id = $1 RETURNING *', 
        [id]
        );

        const monitor = result.rows[0];

        res.json({
            message: `monitor ${monitor.is_active ? 'resumed' : 'paused'}`,
            data: monitor,
        });
        

    } catch (err) {
        next(err);
    }

});


// Clear a Monitor's history


router.delete('/:id/history', getMonitorById, async (req, res, next) => {
    try {
        const id = req.monitorId;
        const result = await pool.query(
        'DELETE FROM ping_logs WHERE monitor_id = $1 RETURNING *',
        [id]
        );
        res.json({
            message: `cleared ${result.rowCount} ping logs for monitor ${id}`,
            data: result.rows,
        });
    } catch (err) {
        next(err);
    }
});



module.exports = router;