const express = require("express");
const router = express.Router();

const {
  registerForEvent,
  getMyRegistrations,
} = require("../controllers/registrationController");

// Register for an event
router.post("/", registerForEvent);

// Get all registrations of a student
router.get("/:user_id", getMyRegistrations);

module.exports = router;