
// I just thought we'll have a need for this
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
} // We could use it like this: throw new AppError('User not found', 404); much later in our logic

// This is the general error handler
export const errorhandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    
    res.status(statusCode).json({
        success: false,
        message,
        ...process.env.NODE_ENV === 'development' && { stack: err.stack }
    });
}