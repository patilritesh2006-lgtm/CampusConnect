const express = require('express');
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  logoutAllDevices,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');

const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/authMiddleware');

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} = require('../validators/authSchemas');

// 1. Register (with validation & auth rate limit)
router.post('/register', authLimiter, validate(registerSchema), register);

// 2. Login (with validation & auth rate limit & account lockout)
router.post('/login', authLimiter, validate(loginSchema), login);

// 3. Refresh Access Token (Rotation)
router.post('/refresh', refreshToken);

// 4. Logout (Single Device)
router.post('/logout', logout);

// 5. Logout All Devices (Protected)
router.post('/logout-all', authenticateToken, logoutAllDevices);

// 6. Verify Email
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);

// 7. Forgot Password
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);

// 8. Reset Password
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

// 9. Current User Profile (/api/auth/me)
router.get('/me', authenticateToken, getMe);

module.exports = router;
