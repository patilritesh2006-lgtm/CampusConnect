const rateLimit = require('express-rate-limit');

// General rate limiter: 150 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Strict rate limiter for Authentication endpoints: 15 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login/auth attempts from this IP. Please try again after 15 minutes.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
