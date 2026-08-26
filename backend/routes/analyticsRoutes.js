const express = require("express");
const router = express.Router();

const { getAdminAnalytics } = require("../controllers/analyticsController");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

// Admin / Faculty / SuperAdmin Analytics
router.get(
  "/admin-overview",
  authenticateToken,
  requireRole("SUPER_ADMIN", "ADMIN", "FACULTY"),
  getAdminAnalytics
);

module.exports = router;
