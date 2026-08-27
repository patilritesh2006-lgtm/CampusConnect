const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_COOKIE_NAME = 'campusconnect_refresh_token';

/**
 * Generate a short-lived access token (15 minutes)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 1,
    },
    process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
};

/**
 * Generate an opaque, cryptographically secure refresh token
 */
const generateRefreshToken = () => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return { token, expiresAt };
};

/**
 * Generate an opaque single-use auth token (verification / password reset)
 */
const generateAuthToken = (hours = 24) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + hours);
  return { token, expiresAt };
};

/**
 * Cryptographic SHA-256 hash of token for safe DB storage
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Set secure HTTP-only refresh token cookie
 */
const setRefreshTokenCookie = (res, token, expiresAt) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    expires: expiresAt,
    path: '/',
  });
};

/**
 * Clear refresh token cookie on logout
 */
const clearRefreshTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateAuthToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
};
