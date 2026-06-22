const express = require('express');
const monitorController = require('../controllers/monitor.controller');
const getMonitorById = require('../middleware/loadMonitorById');



const router = express.Router();


//GET /monitors - Retrieve all monitors
router.get('/', monitorController.getAllMonitors);
//POST /monitors - Create a new monitor
router.post('/', monitorController.createMonitor);


//GET /monitors/:id/history - Retrieve monitoring Ping history for a specific monitor
router.get('/:id/history', getMonitorById,monitorController.getMonitorHistory);
//Clear a Monitor's history
router.delete('/:id/history', getMonitorById, monitorController.clearMonitorHistory);
//Pause or Resume a Monitor check
router.patch('/:id/toggle', getMonitorById, monitorController.toggleMonitor);

//GET /monitors/:id - Retrieve a specific monitor by ID
router.get('/:id', getMonitorById, monitorController.getMonitorById);
//Delete a monitor
router.delete('/:id', getMonitorById, monitorController.deleteMonitor);
//Update a monitor's name, url or interval_seconds.
router.patch('/:id', getMonitorById, monitorController.updateMonitor);


module.exports = router;