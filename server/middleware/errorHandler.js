/**
 * Custom error class with status code.
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Wraps async route handlers to catch errors automatically.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handler middleware.
 */
export function errorHandler(err, _req, res, _next) {
  console.error('🔥', err);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
