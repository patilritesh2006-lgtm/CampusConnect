const jwt = require("jsonwebtoken");

// ======================================================
// JWT AUTHENTICATION MIDDLEWARE
// ======================================================

const authenticateToken = (req, res, next) => {
  try {
    // ------------------------------------------
    // GET AUTHORIZATION HEADER
    // ------------------------------------------

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided.",
      });
    }

    // ------------------------------------------
    // CHECK BEARER FORMAT
    // ------------------------------------------

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use Bearer token.",
      });
    }

    const token = parts[1];

    // ------------------------------------------
    // VERIFY TOKEN
    // ------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ------------------------------------------
    // SAVE USER INFORMATION
    // ------------------------------------------

    req.user = decoded;

    console.log("========== AUTHENTICATED USER ==========");
    console.log("User ID:", decoded.id);
    console.log("Email:", decoded.email);
    console.log("Role:", decoded.role);

    next();
  } catch (error) {
    console.error("JWT AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

// ======================================================
// ADMIN ROLE MIDDLEWARE
// ======================================================

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (String(req.user.role).toUpperCase() !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

// ======================================================
// STUDENT ROLE MIDDLEWARE
// ======================================================

const requireStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (String(req.user.role).toUpperCase() !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Student privileges required.",
    });
  }

  next();
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  authenticateToken,
  requireAdmin,
  requireStudent,
};