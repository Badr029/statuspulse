const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');

const SALT_ROUNDS = 10;

async function registerUser({email, password}) {
        const normalizedEmail = email.toLowerCase();
        const existingUser = await authRepository.findUserByEmail(normalizedEmail);
        
        if (existingUser.rows.length > 0) {
            const error = new Error('An account with this email already exists');
            error.status = 409;
            throw error;
        }
        
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        const result = await authRepository.createUser(normalizedEmail, hashedPassword);
        
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
        
        return{user,token};
}

module.exports = { registerUser };