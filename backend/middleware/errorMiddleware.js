/**
 * Centralized Error Handling Middleware for CampusConnect API
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected internal server error occurred.";

  if (statusCode >= 500) {
    console.error("❌ [SERVER ERROR]:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
