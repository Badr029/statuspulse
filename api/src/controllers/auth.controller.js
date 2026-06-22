const authService = require('../services/auth.service');

async function register(req, res, next){
    try{
        const data = await authService.registerUser(req.body);
        res.status(201).json({
            data: data
        });

    } catch (error) {
        next(error);
    }

}

module.exports = {register};