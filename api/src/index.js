require ('dotenv').config(); //load environment variables from .env file

const express = require('express'); 
const cors = require('cors'); 
const morgan = require('morgan'); 
const helmet = require('helmet'); 

const healthRouter = require('./routes/health');        
const monitorRouter = require('./routes/monitors'); 
const errorHandler = require('./middleware/errorHandler'); 

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware

app.use(helmet());
app.use(cors());
app.use(morgan('dev')); 
app.use(express.json());

//routes

app.use('/health', healthRouter);
app.use('/monitors', monitorRouter); 

//404 error handler

app.use((req, res) => {
    res.status(404).json({ error:{ message: 'Route not found'}});
});

//Global error handler
app.use(errorHandler);

//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;