const {body, validationResult} = require('express-validator');

const validateRegister = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({min: 8})
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character'),
];

function requireEmailAndPassword(req,res,next){
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({
                error: {
                message:'Email and password are required',
                },
        });
    }

    next();
}

function handleValidationErrors(req,res,next){
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        return res.status(400).json({
            error: {
                message: 'Validation Error',
                details: errors.array()
            },
        });
    }

    next();
}

module.exports = {validateRegister, requireEmailAndPassword, handleValidationErrors};