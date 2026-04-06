const AppError = require('../utils/AppError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
        return;
    }

    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') {
        error = new AppError(`Invalid ${error.path}: ${error.value}.`, 400);
    }

    if (error.code === 11000) {
        const duplicateValue = err.message ? err.message.match(/(["'])(\\?.)*?\1/) : null;
        const value = duplicateValue ? duplicateValue[0] : 'duplicate value';
        error = new AppError(`Duplicate field value: ${value}. Please use another value.`, 400);
    }

    if (error.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el) => el.message);
        error = new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
    }

    if (error.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token. Please log in again.', 401);
    }

    if (error.name === 'TokenExpiredError') {
        error = new AppError('Your token has expired. Please log in again.', 401);
    }

    sendErrorProd(error, res);
};
