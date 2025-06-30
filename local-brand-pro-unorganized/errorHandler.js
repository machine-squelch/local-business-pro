const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error(err.stack);
  
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    const errors = {};
    
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    
    return res.status(statusCode).json({
      message: 'Validation Error',
      errors
    });
  }
  
  if (err.name === 'CastError') {
    // Mongoose cast error (e.g., invalid ObjectId)
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  
  if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    message = 'Duplicate key error';
    
    // Try to extract the duplicate field
    const field = Object.keys(err.keyValue)[0];
    if (field) {
      message = `${field} already exists`;
    }
  }
  
  // Send the error response
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

module.exports = errorHandler;
