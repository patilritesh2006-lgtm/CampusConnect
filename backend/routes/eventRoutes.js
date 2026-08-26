const express = require("express");

const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getRegisteredStudents,
  getDashboardStats,
} = require("../controllers/eventController");

const {
  authenticateToken,
  requireAdmin,
  requireStudent,
} = require("../middleware/authMiddleware");

const { validate } = require("../middleware/validate");
const { createEventSchema, updateEventSchema } = require("../validators/eventSchemas");

// ======================================================
// ADMIN DASHBOARD STATS
// GET /api/events/stats
// ======================================================

router.get(
  "/stats",
  authenticateToken,
  requireAdmin,
  getDashboardStats
);

// ======================================================
// GET ALL EVENTS
// GET /api/events
// STUDENT + ADMIN
// ======================================================

router.get(
  "/",
  authenticateToken,
  getAllEvents
);

// ======================================================
// CREATE EVENT
// POST /api/events
// ADMIN ONLY
// ======================================================

router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validate(createEventSchema),
  createEvent
);

// ======================================================
// REGISTER FOR EVENT
// POST /api/events/:id/register
// STUDENT ONLY
// ======================================================

router.post(
  "/:id/register",
  authenticateToken,
  requireStudent,
  registerForEvent
);

// ======================================================
// GET REGISTERED STUDENTS
// GET /api/events/:id/students
// ADMIN ONLY
// ======================================================

router.get(
  "/:id/students",
  authenticateToken,
  requireAdmin,
  getRegisteredStudents
);

// ======================================================
// GET SINGLE EVENT
// GET /api/events/:id
// STUDENT + ADMIN
// ======================================================

router.get(
  "/:id",
  authenticateToken,
  getEventById
);

// ======================================================
// UPDATE EVENT
// PUT /api/events/:id
// ADMIN ONLY
// ======================================================

router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validate(updateEventSchema),
  updateEvent
);

// ======================================================
// DELETE EVENT
// DELETE /api/events/:id
// ADMIN ONLY
// ======================================================

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  deleteEvent
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;