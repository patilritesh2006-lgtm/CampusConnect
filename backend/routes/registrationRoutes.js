const express = require("express");

const router = express.Router();

const {
  registerForEvent,
  getMyRegistrations,
} = require("../controllers/registrationController");

const {
  authenticateToken,
  requireStudent,
} = require("../middleware/authMiddleware");

// ======================================================
// REGISTER FOR EVENT
// POST /api/registrations
// STUDENT ONLY
// ======================================================

router.post(
  "/",
  authenticateToken,
  requireStudent,
  registerForEvent
);

// ======================================================
// GET MY REGISTRATIONS
// GET /api/registrations/:user_id
// STUDENT ONLY
// ======================================================

router.get(
  "/:user_id",
  authenticateToken,
  requireStudent,
  getMyRegistrations
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
