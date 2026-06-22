const monitorRepository = require('../repositories/monitor.repository');


// Middleware to fetch monitor by ID and attach to req object
async function getMonitorById(req, res, next) {
        try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({error: {message: 'Monitor id is Invalid. It must be a number.'}});
        }
        const result = await monitorRepository.getMonitorById(id);

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

module.exports = getMonitorById
