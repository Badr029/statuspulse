const express = require('express'); //get the express module
const healthController = require('../controllers/health.controller');

const router = express.Router(); 

router.get('/', healthController.health);

module.exports = router;