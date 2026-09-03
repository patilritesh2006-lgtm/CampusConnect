const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");
const { getAlerts, resolveAlert } = require("../controllers/fraudController");

router.get("/alerts", authenticateToken, requireAdmin, getAlerts);
router.post("/resolve", authenticateToken, requireAdmin, resolveAlert);

module.exports = router;