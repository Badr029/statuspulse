function errorHandler(err, req, res, next) {
    console.error(err.stack); // log the full error internaly 

    const status = err.status || 500; // send clean response to the client if there is no status code send 500
    const message = err.message || 'Internal Server Error'; // send clean response to the client if there is no message send 'Internal Server Error'

    
    const errorResponse = { message };
    
    if (process.env.NODE_ENV === 'development'){

        errorResponse.stack = err.stack; // stack only show for development 

        };// send response to the client 

    res.status(status).json({ error: errorResponse }); 

}


module.exports = errorHandler;
