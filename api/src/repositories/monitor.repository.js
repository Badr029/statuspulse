const pool = require('../config/db');


function getAllMonitors(){
    return pool.query(
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
}

function getMonitorById(id){
    return  pool.query(
            'SELECT * FROM monitors WHERE id = $1',
            [id]
        );
}

function createMonitor({name,url,interval_seconds}){
    return  pool.query(
            'INSERT INTO monitors (name, url, interval_seconds) VALUES ($1, $2, $3) RETURNING *',
            [name, url, interval_seconds]
        );
}

function deleteMonitor(id){
    return   pool.query(
        'DELETE FROM monitors WHERE id = $1 RETURNING *',
        [id]
    );
}

function getMonitorHistory(id, limit){
    return  pool.query(
            `SELECT id,status,status_code,latency_ms,error_message,checked_at FROM ping_logs WHERE monitor_id = $1 ORDER BY checked_at DESC LIMIT $2`,
            [id, limit]
        );
}

function clearMonitorHistory(id){
    return  pool.query(
            'DELETE FROM ping_logs WHERE monitor_id = $1 RETURNING *',
            [id]
        );
}

function toggleMonitor(id){
    return  pool.query(
        'UPDATE monitors SET is_active = NOT is_active WHERE id = $1 RETURNING *', 
        [id]
    );
}


function updateMonitor(fields, values) {
    return pool.query(
        `UPDATE monitors SET ${fields} WHERE id = $${values.length} RETURNING *`,
        values
    );
}

module.exports = {
    getAllMonitors,
    getMonitorById,
    createMonitor,
    deleteMonitor,
    getMonitorHistory,
    clearMonitorHistory,
    toggleMonitor,
    updateMonitor
}