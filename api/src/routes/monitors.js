const express = require('express');
const pool = require('../db/conPool');
const router = express.Router();

router.get('/', async (req, res) => {
    res.json({
message: 'Monitor endpoint is working and will return monitor data in the future.',
    });
}   );

module.exports = router;