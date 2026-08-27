const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * JWT Access Token Authentication Middleware
 * Validates access token and checks tokenVersion for immediate revocation.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use Bearer <token>.',
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_jwt_secret_change_in_production'
    );

    // Verify user exists and tokenVersion matches
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        tokenVersion: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session is no longer valid.',
      });
    }

    // Check token version (invalidation on password reset / logout all devices)
    if (decoded.tokenVersion && decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    // Check account lockout
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      return res.status(403).json({
        success: false,
        message: 'Account is temporarily locked. Please try again later.',
      });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token.',
    });
  }
};

/**
 * Flexible Role Guard Middleware
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userRole = String(req.user.role || '').toUpperCase();
    const formattedAllowed = allowedRoles.map((r) => String(r).toUpperCase());

    if (!formattedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
};

const requireAdmin = requireRole('ADMIN');
const requireStudent = requireRole('STUDENT');

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireStudent,
};
