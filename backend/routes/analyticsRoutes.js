const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

router.get("/admin", authenticateToken, requireAdmin, analyticsController.getAdminAnalytics);

module.exports = router;
