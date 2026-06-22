const express = require('express');
const authController = require('../controllers/auth.controller');

const{
    requireEmailAndPassword,
    validateRegister,
    handleValidationErrors
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', requireEmailAndPassword, validateRegister, handleValidationErrors, authController.register);

module.exports = router;