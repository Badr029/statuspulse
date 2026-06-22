const pool = require('../config/db');

function findUserByEmail(email) {
    return  pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
    }
    
function createUser(email, hashedPassword) {
    return  pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
            [email, hashedPassword]
        );
}

module.exports = { findUserByEmail, createUser };