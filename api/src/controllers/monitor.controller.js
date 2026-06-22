const monitorService = require('../services/monitor.service');


async function getAllMonitors (req, res, next) {
    try {
        const result = await monitorService.getAllMonitors();
        res.json(
            result
        );
    } catch (error) {
        next(error);
    }
}

async  function createMonitor (req, res, next) {

    try {
        const result = await monitorService.createMonitor(req.body);
        res.status(201).json(
                result
            );
    } catch (error) {
        next(error);
    }
}

async function getMonitorById (req, res) {
    res.json({
        data: req.monitor,
    });
}

async function getMonitorHistory (req, res, next) {
    try {        
        const result = await monitorService.getMonitorHistory(req.monitor, req.monitorId, req.query.limit);

        res.json(
            result
        );

    } catch (error) {
        next(error);
    }
}

async function deleteMonitor (req, res, next) {
    try {
        const result = await monitorService.deleteMonitor(req.monitorId);

        res.json(
            result
        );

    } catch (err) {
        next(err);
    }
}

async function updateMonitor (req, res, next) {
    try {

        const result = await monitorService.updateMonitor(req.monitorId, req.body);
        
        res.json(
            result
        );

    } catch (err) {
        next(err);
    }

}

async function toggleMonitor (req, res, next) {
    try {
        const result = await monitorService.toggleMonitor(req.monitorId);
        
        res.json(
            result
        );
    } catch (err) {
        next(err);
    }
}

async function clearMonitorHistory  (req, res, next) {
    try {
        const result = await monitorService.clearMonitorHistory(req.monitorId);
        res.json(
            result,
        );
    } catch (err) {
        next(err);
    }
}

module.exports = { 
    getAllMonitors,
    createMonitor, 
    getMonitorById, 
    getMonitorHistory, 
    deleteMonitor, 
    updateMonitor, 
    toggleMonitor,
    clearMonitorHistory
};