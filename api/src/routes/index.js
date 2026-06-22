const express = require('express');

const authRouter = require('./auth.routes');
const healthRouter = require('./health.routes');
const monitorRouter = require('./monitors.routes');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/health', healthRouter);
router.use('/monitors', monitorRouter);

module.exports = router;