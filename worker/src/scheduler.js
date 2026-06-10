const cron = require('node-cron');
const pool = require('./db/conPool');
const { sendEmailAlert } = require('./services/email');
const {probeUrl} = require('./prober');


const failureCounts = {};

async function checkMonitors(monitor) {
    console.log(`[scheduler] Pinging : ${monitor.name} (${monitor.url})`);
    
    const result = await probeUrl(monitor.url);

    await pool.query(
        `INSERT INTO ping_logs (monitor_id, status, status_code, latency_ms, error_message) VALUES ($1, $2, $3, $4, $5)`
        , [monitor.id, result.status, result.status_code, result.latency_ms, result.error_message]);



    console.log(
    `[scheduler] ${monitor.name} → ${result.status.toUpperCase()} ` +
    `(${result.latency_ms}ms${result.status_code ? `, HTTP ${result.status_code}` : ''})`
    );

    if (result.status === 'down') {
        failureCounts[monitor.id] = (failureCounts[monitor.id] || 0) + 1;
        if (failureCounts[monitor.id] === 3) {
            console.log(`[scheduler] sending DOWN alert for ${monitor.name} `);
            await sendEmailAlert({
                monitor,
                status: 'down',
                error_message: result.error_message,
            });
            }
    } else {
        if (failureCounts[monitor.id] >= 3) {
            console.log(`[scheduler] sending RECOVERED alert for ${monitor.name} `);
            await sendEmailAlert({
                monitor,
                status: 'up',
                latency_ms: result.latency_ms,
            });
        }

        failureCounts[monitor.id] = 0;
    }
    }


async function runChecks() {
    console.log('[scheduler] Starting monitor checks...');
    try {
        const { rows: monitors } = await pool.query('SELECT * FROM monitors WHERE is_active = true');

    if (monitors.length === 0) {
        console.log('[scheduler] No active monitors found.');
        return;
    }

    console.log(`[scheduler] checking ${monitors.length} monitors...`);

    await Promise.allSettled(monitors.map(monitor => checkMonitors(monitor)));

    console.log('[scheduler] Monitor checks completed.');
    } catch (err) {
        console.error('[scheduler] Error during monitor checks', err.message);
    }
}

function startScheduler() {
    console.log('[scheduler] Scheduler started, running checks every minute');
    cron.schedule('* * * * *', runChecks);
    runChecks();
}

module.exports = { startScheduler };