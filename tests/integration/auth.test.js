const request = require('supertest');
const app = require('../../api/src/index');
const pool = require('../../api/src/db/conPool');
const jwt = require('jsonwebtoken');

describe('/authentication API', () => {
    beforeEach(async () => {
        await pool.query('DELETE FROM users');
    });

    afterAll(async () => {
        await pool.end();
    });

    it('should return 400 when email or password is required', async () => {
        const response = await request(app).post('/auth/register').send({});
        expect(response.status).toBe(400);
    });

    it('should register a new user with valid email and password', async () => {
        const response = await request(app).post('/auth/register').send({
            email: 'test@example.com',
            password: 'Password1!',
        });

        expect(response.status).toBe(201);
        expect(response.body.data.user.id).toBeDefined();
        expect(response.body.data.user.email).toBe('test@example.com');
        expect(response.body.data.token).toBeDefined();
    });

    it('should return 400 when email is invalid', async () => {
        const response = await request(app).post('/auth/register').send({
            email: 'invalid-email',
            password: 'password',
        });

        expect(response.status).toBe(400);
        expect(response.body.error.message).toBe('Validation Error');
        expect(response.body.error.details.some(e => e.msg.includes('email'))).toBe(true);
    });

    it('should return 400 when password is too short', async () => {
        const response = await request(app).post('/auth/register').send({
            email: 'test@example.com',
            password: 'pass',
        });

        expect(response.status).toBe(400);
        expect(response.body.error.message).toBe('Validation Error');
        expect(response.body.error.details.some(e => e.msg.includes('8 characters'))).toBe(true);
    });

    it('should return 400 when password does not contain at least one uppercase letter', async () => {
        const response = await request(app).post('/auth/register').send({
            email: 'test@example.com',
            password: 'password1!',
        });

        expect(response.status).toBe(400);
        expect(response.body.error.message).toBe('Validation Error');
        expect(response.body.error.details.some(e => e.msg.includes('uppercase'))).toBe(true);
    });

    it('should return 400 when password without a number', async () => {    
        const response = await request(app).post('/auth/register').send({
            email: 'test@example.com',
            password: 'Password!',
        });
        expect(response.status).toBe(400);
        expect(response.body.error.message).toBe('Validation Error');
        expect(response.body.error.details.some(e => e.msg.includes('number'))).toBe(true);
    })

    it('should return 400 when password without a special character', async () => {    
        const response = await request(app).post('/auth/register').send({
            email: 'test@example.com',
            password: 'Password1',
        });
        expect(response.status).toBe(400);
        expect(response.body.error.message).toBe('Validation Error');
        expect(response.body.error.details.some(e => e.msg.includes('special character'))).toBe(true);
    })

    it('should return 409 when email already exists', async () => {
        await request(app).post('/auth/register').send({
            email: 'test@example.com',
            password: 'Password1!',
        });

        const response = await request(app).post('/auth/register').send({
            email: 'test@example.com',
            password: 'Password1!',
        });
        expect(response.status).toBe(409);
        expect(response.body.error).toContain('already exists');
    });

    it('returns a valid JWT token that can be decoded', async () => {
        const response = await request(app).post('/auth/register').send({
            email: 'test@example.com',
            password: 'Password1!',
        });
        
        const token = response.body.data.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.email).toBe('test@example.com');
    })
    
});