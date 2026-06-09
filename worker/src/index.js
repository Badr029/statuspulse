require('dotenv').config();

const {startScheduler} = require('./scheduler');

console.log('[worker] StatusPulse Worker starting...');

startScheduler();