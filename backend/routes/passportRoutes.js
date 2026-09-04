const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getMyPassport,
  getPublicPassport,
  updatePassportPrivacy,
  completeOnboarding,
} = require("../controllers/passportController");

// Authenticated student passport
router.get("/me", authenticateToken, getMyPassport);
router.put("/privacy", authenticateToken, updatePassportPrivacy);
router.post("/onboarding", authenticateToken, completeOnboarding);

// Public verified student passport (Zero PII leaks & Granular Privacy)
router.get("/:username", getPublicPassport);

module.exports = router;