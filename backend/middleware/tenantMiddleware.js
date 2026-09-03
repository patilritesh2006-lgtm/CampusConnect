const prisma = require("../config/prisma");

/**
 * Middleware: Enforce Multi-Tenant Isolation
 * Ensures users can only access data belonging to their institution/college,
 * unless they possess the SUPER_ADMIN role.
 */
const requireTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required for tenant verification.",
    });
  }

  // SUPER_ADMIN has global multi-tenant access
  if (req.user.role === "SUPER_ADMIN") {
    return next();
  }

  if (!req.user.collegeId) {
    return res.status(403).json({
      success: false,
      message: "User is not assigned to any institution.",
    });
  }

  req.tenantCollegeId = req.user.collegeId;
  next();
};

/**
 * Verifies that a resource belongs to the user's institution.
 * @param {Function} resourceCollegeIdExtractor async function (req) => collegeId
 */
const enforceSameTenant = (resourceCollegeIdExtractor) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      if (req.user.role === "SUPER_ADMIN") {
        return next();
      }

      const resourceCollegeId = await resourceCollegeIdExtractor(req);
      if (!resourceCollegeId) {
        return res.status(404).json({ success: false, message: "Resource not found." });
      }

      if (resourceCollegeId !== req.user.collegeId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Access denied to cross-institution data.",
        });
      }

      next();
    } catch (error) {
      console.error("Tenant enforcement error:", error);
      return res.status(500).json({ success: false, message: "Tenant verification failed." });
    }
  };
};

module.exports = {
  requireTenant,
  enforceSameTenant,
};