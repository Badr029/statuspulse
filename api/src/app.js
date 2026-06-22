require ('dotenv').config(); //load environment variables from .env file

const express = require('express'); 
const cors = require('cors'); 
const morgan = require('morgan'); 
const helmet = require('helmet'); 

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler'); 

const app = express();



// Middleware

app.use(helmet());
app.use(cors());
app.use(morgan('dev')); 
app.use(express.json());

//routes

app.use(routes);


//404 error handler

app.use((req, res) => {
    res.status(404).json({ error:{ message: 'Route not found'}});
});

//Global error handler
app.use(errorHandler);





module.exports = app;