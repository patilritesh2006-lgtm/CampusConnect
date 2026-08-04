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

// ====================== DASHBOARD STATS ======================
router.get("/stats", getDashboardStats);

// ====================== GET ALL EVENTS ======================
router.get("/", getAllEvents);

// ====================== CREATE EVENT ======================
router.post("/", createEvent);

// ====================== REGISTER FOR EVENT ======================
router.post("/:id/register", registerForEvent);

// ====================== GET REGISTERED STUDENTS ======================
router.get("/:id/students", getRegisteredStudents);

// ====================== GET SINGLE EVENT ======================
router.get("/:id", getEventById);

// ====================== UPDATE EVENT ======================
router.put("/:id", updateEvent);

// ====================== DELETE EVENT ======================
router.delete("/:id", deleteEvent);

module.exports = router;