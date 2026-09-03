const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");
const { getIntelligenceReport } = require("../controllers/intelligenceController");

router.get("/", authenticateToken, requireAdmin, getIntelligenceReport);

module.exports = router;