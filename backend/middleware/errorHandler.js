/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";

  console.error("❌ UNHANDLED ERROR:", err);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    err.message || "An unexpected internal server error occurred.";

  return res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
