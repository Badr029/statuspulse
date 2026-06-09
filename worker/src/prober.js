const axios = require('axios');

async function probeUrl(url) {

const startTime = Date.now();
try {
    const response = await axios.get(url, { timeout: 10000, maxRedirects: 5, validateStatus: () => true });
    const latency = Date.now() - startTime;
    const isUp = response.status >= 200 && response.status < 300;
    return {
        status: isUp ? 'up' : 'down',
        status_code: response.status,
        latency_ms: latency,
        error_message: isUp ? null : `Received status code ${response.status}`,
    };
}
catch (err){
    const latency = Date.now() - startTime;
    return {
        status: 'down',
        status_code: null,
        latency_ms: latency,
        error_message: err.code || err.message,
    };
}

}

module.exports = {probeUrl};