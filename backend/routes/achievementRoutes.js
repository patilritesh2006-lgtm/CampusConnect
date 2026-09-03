const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { getAchievements } = require("../controllers/achievementController");

router.get("/", authenticateToken, getAchievements);

module.exports = router;