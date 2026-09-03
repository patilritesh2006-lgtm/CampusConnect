const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getMyPassport,
  getPublicPassport,
  updatePassportPrivacy,
} = require("../controllers/passportController");

// Authenticated student passport
router.get("/me", authenticateToken, getMyPassport);
router.put("/privacy", authenticateToken, updatePassportPrivacy);

// Public verified student passport (Zero PII leaks)
router.get("/:username", getPublicPassport);

module.exports = router;