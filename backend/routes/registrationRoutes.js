const express = require('express');

const router = express.Router();

const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
} = require('../controllers/registrationController');

const {
  authenticateToken,
  requireStudent,
} = require('../middleware/authMiddleware');

const { validate } = require('../middleware/validate');
const { createRegistrationSchema } = require('../validators/registrationSchemas');

// ======================================================
// REGISTER FOR EVENT
// POST /api/registrations
// STUDENT ONLY
// ======================================================

router.post(
  '/',
  authenticateToken,
  requireStudent,
  validate(createRegistrationSchema),
  registerForEvent
);

// ======================================================
// GET MY REGISTRATIONS
// GET /api/registrations/:user_id
// STUDENT ONLY
// ======================================================

router.get(
  '/:user_id',
  authenticateToken,
  requireStudent,
  getMyRegistrations
);

// ======================================================
// CANCEL REGISTRATION
// DELETE /api/registrations/:registrationId
// ======================================================

router.delete(
  '/:registrationId',
  authenticateToken,
  cancelRegistration
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
