const express = require("express");

const router = express.Router();

const {
  registerForEvent,
  getMyRegistrations,
} = require("../controllers/registrationController");

// ======================================================
// REGISTER FOR EVENT
// POST /api/registrations
// ======================================================

router.post("/", registerForEvent);

// ======================================================
// GET MY REGISTRATIONS
// GET /api/registrations/:user_id
// ======================================================

router.get("/:user_id", getMyRegistrations);

module.exports = router;