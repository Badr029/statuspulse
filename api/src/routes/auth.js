const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/conPool');
const {body, validationResult} = require('express-validator');


const SALT_ROUNDS = 10;

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


router.post('/register', requireEmailAndPassword, validateRegister, handleValidationErrors,  async (req, res, next) => {
    try{
        const { email, password } = req.body;



        // if (!email || !email.includes('@')) {
        //     return res.status(400).json({ error: 'A valid email address is required' });
        // }

        // if (!password || password.length < 8) {
        //     return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        // }

        const normalizedEmail = req.body.email;

        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }


        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
            [normalizedEmail, hashedPassword]
        );

        const user = result.rows[0];

        const token = jwt.sign(
            {
                user_id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d',
            }
        );
        
        res.status(201).json({
            data: {user,token},
        }
        );

    } catch (error) {
        next(error);
    }
                
});

module.exports = router;