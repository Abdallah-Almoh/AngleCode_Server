const appError = require('./../utils/appError');

const  handleCastErrorDB = err => {
const message = `Invalid ${err.path}:${err.value}.`;
const error=  new appError(message, 400);

return error;
 
};
const handleDuplicateFieldsDB = err => {

    const message = `the ${err.keyValue.name}is already defined`;
    return new appError(message, 400);
};
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data ${errors.join(', ')}`;
return new appError(message, 400);
};

const handleJWTError = () => new appError('Invalid token. please log in again!',401);
const handleJWTExpiedError = () => new appError('your token has expired! please log in again.',401);
const sendErrorDev =(err,res) =>{

    res.status(err.statusCode).json({
        status: err.status,
        err:err,
        message: err.message,
        stack: err.stack
    });
    
};

const sendErrorProd = (err,res) =>{

    if(err.isOperational) {
        
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }else{
            console.error('ERROR💥', err);
        res.status(500).json({
            status: 'error',
            message: 'something went very wrong!'
        });
    }
};
module.exports= (err,req,res,next) => {
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV ==='development'){
        sendErrorDev(err, res);
} else if(process.env.NODE_ENV === 'production') {
     //let error = {...err};

    if(err.name === 'CastError') err = handleCastErrorDB(err);
    if(err.code === 11000) err = handleDuplicateFieldsDB(err);
    if(err.name=== 'ValidationError') err = handleValidationErrorDB(err);
    if(err.name==='JsonWebTokenError') err = handleJWTError();
    if (err.name==='TokenExpiredError') err = handleJWTExpiedError();
    sendErrorProd( err, res);
    
}

}; 