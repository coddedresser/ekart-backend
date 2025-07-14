const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // Determine status code
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = 'Resource not found';
    statusCode = 404;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors && typeof err.errors === 'object') {
    // Collect array of validation messages
    message = Object.values(err.errors).map(e => e.message);
    statusCode = 400;
  }

  // Handle duplicate key error (MongoDB)
  if (err.code === 11000) {
    // Safely extract the duplicated field names
    const fields = err.keyValue && typeof err.keyValue === 'object'
      ? Object.keys(err.keyValue).join(', ')
      : '';
    message = `Duplicate field value${fields ? `: ${fields}` : ''}`;
    statusCode = 400;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'JSON Web Token is invalid';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'JSON Web Token has expired';
    statusCode = 401;
  }

  // Send JSON response
  res.status(statusCode).json({ message });
};

module.exports = { notFound, errorHandler };
