const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const {
  generateAccessToken,
  generateRefreshToken,
  generateAuthToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
} = require('../utils/tokens');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../utils/emailService');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// ======================================================
// REGISTER
// ======================================================
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, department, year, role, collegeId } =
      req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password with salt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        department: department?.trim() || null,
        year: year || null,
        role: role || 'STUDENT',
        collegeId: collegeId || null,
        isVerified: false,
      },
    });

    // Generate Email Verification Token
    const { token: verificationToken, expiresAt } = generateAuthToken(24);
    await prisma.authToken.create({
      data: {
        tokenHash: hashToken(verificationToken),
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        expiresAt,
      },
    });

    // Send verification email asynchronously
    sendVerificationEmail({
      to: user.email,
      fullName: user.fullName,
      token: verificationToken,
    }).catch(console.error);

    // Generate Access & Refresh tokens
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expiresAt: refreshExpiresAt } =
      generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: refreshExpiresAt,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    setRefreshTokenCookie(res, refreshToken, refreshExpiresAt);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email address.',
      token: accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// LOGIN (WITH BRUTE-FORCE LOCKOUT)
// ======================================================
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check Account Lockout
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      const remainingMs = new Date(user.lockedUntil).getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

      return res.status(403).json({
        success: false,
        message: `Account is locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const updatedFailedAttempts = user.failedLoginAttempts + 1;
      let updateData = { failedLoginAttempts: updatedFailedAttempts };

      if (updatedFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutUntil = new Date();
        lockoutUntil.setMinutes(
          lockoutUntil.getMinutes() + LOCKOUT_DURATION_MINUTES
        );
        updateData.lockedUntil = lockoutUntil;

        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });

        return res.status(403).json({
          success: false,
          message: `Account locked for ${LOCKOUT_DURATION_MINUTES} minutes due to ${MAX_FAILED_ATTEMPTS} consecutive failed attempts.`,
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      const remainingTries = MAX_FAILED_ATTEMPTS - updatedFailedAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. (${remainingTries} attempt(s) remaining before lockout)`,
      });
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expiresAt: refreshExpiresAt } =
      generateRefreshToken();

    // Store hashed refresh token in database
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: refreshExpiresAt,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    setRefreshTokenCookie(res, refreshToken, refreshExpiresAt);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token: accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// REFRESH TOKEN (WITH ROTATION)
// ======================================================
const refreshToken = async (req, res, next) => {
  try {
    const incomingToken =
      req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || req.body?.refreshToken;

    if (!incomingToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided.',
      });
    }

    const tokenHash = hashToken(incomingToken);

    // Find active refresh token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || new Date() > storedToken.expiresAt) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token is invalid or expired. Please log in again.',
      });
    }

    const { user } = storedToken;

    // Invalidate the old refresh token (Token Rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Generate new Access & Refresh Token pair
    const newAccessToken = generateAccessToken(user);
    const { token: newRefreshToken, expiresAt: newExpiresAt } =
      generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefreshToken),
        userId: user.id,
        expiresAt: newExpiresAt,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    setRefreshTokenCookie(res, newRefreshToken, newExpiresAt);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      token: newAccessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// LOGOUT (SINGLE DEVICE)
// ======================================================
const logout = async (req, res, next) => {
  try {
    const incomingToken =
      req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || req.body?.refreshToken;

    if (incomingToken) {
      const tokenHash = hashToken(incomingToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revoked: false },
        data: { revoked: true },
      });
    }

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// LOGOUT ALL DEVICES (INVALIDATE ALL SESSIONS)
// ======================================================
const logoutAllDevices = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Increment user's tokenVersion to immediately invalidate all access tokens
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// VERIFY EMAIL
// ======================================================
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const tokenHash = hashToken(token);

    const authToken = await prisma.authToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !authToken ||
      authToken.type !== 'EMAIL_VERIFICATION' ||
      authToken.usedAt ||
      new Date() > authToken.expiresAt
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.',
      });
    }

    // Mark user verified and token used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: authToken.userId },
        data: { isVerified: true },
      }),
      prisma.authToken.update({
        where: { id: authToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now access all campus features.',
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          'If an account exists with that email address, a password reset link has been sent.',
      });
    }

    // Invalidate prior reset tokens
    await prisma.authToken.deleteMany({
      where: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        usedAt: null,
      },
    });

    // Generate 1-hour reset token
    const { token: resetToken, expiresAt } = generateAuthToken(1);
    await prisma.authToken.create({
      data: {
        tokenHash: hashToken(resetToken),
        userId: user.id,
        type: 'PASSWORD_RESET',
        expiresAt,
      },
    });

    sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      token: resetToken,
    }).catch(console.error);

    return res.status(200).json({
      success: true,
      message:
        'If an account exists with that email address, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const tokenHash = hashToken(token);

    const authToken = await prisma.authToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !authToken ||
      authToken.type !== 'PASSWORD_RESET' ||
      authToken.usedAt ||
      new Date() > authToken.expiresAt
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password, increment tokenVersion (logs out other sessions), mark token used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: authToken.userId },
        data: {
          password: hashedPassword,
          tokenVersion: { increment: 1 },
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.authToken.update({
        where: { id: authToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: authToken.userId, revoked: false },
        data: { revoked: true },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET CURRENT USER (/me)
// ======================================================
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        department: true,
        year: true,
        profilePhoto: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAllDevices,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
};
