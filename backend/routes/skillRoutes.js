const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { getMySkills, addEvidence } = require("../controllers/skillController");

router.get("/", authenticateToken, getMySkills);
router.post("/evidence", authenticateToken, addEvidence);

module.exports = router;