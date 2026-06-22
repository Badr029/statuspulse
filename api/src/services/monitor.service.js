const monitorRepository = require('../repositories/monitor.repository');
const {isValidUrl} = require('../validators/monitorUrl.validator');


async function getAllMonitors() {
    const result = await monitorRepository.getAllMonitors();
    return{
        data: result.rows,
        count: result.rowCount,
    }
};

async function createMonitor({name, url, interval_seconds}) {
    
    if (!name || name.trim() === '') {
        const error = new Error('Name is required and cannot be empty.');
        error.status = 400;
        throw error;
    }
    
    if (!url || !isValidUrl(url)) {
        const error = new Error('URL is required and must be a valid http|https URL.');
        error.status = 400;
        throw error;
    }
    
    const interval = interval_seconds || 60;
    
    if (interval < 30 || interval > 3600) {
        const error = new Error('Interval must be between 30 and 3600 seconds.');
        error.status = 400;
        throw error;
    }
    
    const result = await monitorRepository.createMonitor({
        name: name.trim(),
        url: url.trim(),
        interval_seconds: interval
    });
    
    return {
        message: 'monitor created',
        data: result.rows[0],
    }
}

async function getMonitorHistory (monitor,id,queryLimit){
const limit = Math.min(parseInt(queryLimit) || 24, 200);

        const historyResult = await monitorRepository.getMonitorHistory(id, limit);

        //Calculate uptime percentage
        const totalPings = historyResult.rows.length;
        const successfulPings = historyResult.rows.filter(row => row.status === 'up').length;
        const uptimePercentage = totalPings > 0
            ? ((successfulPings / totalPings) * 100).toFixed(2)
            : null;

        return {

            monitor,
            history: historyResult.rows,
            summary: {
                total_pings: totalPings,
                successful_pings: successfulPings,
                downtime_pings: totalPings - successfulPings,
                uptime_percentage: uptimePercentage,
            },
        };     
}

async function deleteMonitor(id) {
    const result = await monitorRepository.deleteMonitor(id);
    return {
        message: 'monitor deleted',
        data: result.rows[0],
    }
}

async function updateMonitor(id, { name, url, interval_seconds }) {

        if (name && name.trim() === '') {
            const error = new Error('Name cannot be empty.');
            error.status = 400;
            throw error;
        }    

        if (url && !isValidUrl(url)) {
            const error = new Error('URL must be a valid http|https URL.');
            error.status = 400;
            throw error;
        }

        if (interval_seconds && (interval_seconds < 30 || interval_seconds > 3600)) {
            const error = new Error('Interval must be between 30 and 3600 seconds.');
            error.status = 400;
            throw error;
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
            const error = new Error('No fields to update' );
            error.status = 400;
            throw error;
        }

        values.push(id);

        const result =  await monitorRepository.updateMonitor(fields.join(', '), values);
        return {
            message: 'monitor updated',
            data: result.rows[0],
        }

}

async function toggleMonitor(id) {
    const result = await monitorRepository.toggleMonitor(id);
    const monitor = result.rows[0];
    return {
        message: `monitor ${monitor.is_active ? 'resumed' : 'paused'}`,
        data: monitor,
    }
}

async function clearMonitorHistory(id) {
    const result = await monitorRepository.clearMonitorHistory(id);
    return {
        message: 'monitor history cleared',
        data: result.rows[0],
    }
    
}

module.exports = {
    getAllMonitors,
    createMonitor,
    getMonitorHistory,
    deleteMonitor,
    updateMonitor,
    toggleMonitor,
    clearMonitorHistory
}