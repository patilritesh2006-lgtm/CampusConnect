const express = require('express');

const router = express.Router();

const {
  getAllStudents,
  getStudentById,
} = require('../controllers/studentController');

const {
  authenticateToken,
  requireAdmin,
} = require('../middleware/authMiddleware');

// ======================================================
// ADMIN STUDENT ROUTES
// ======================================================

// Get all students
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  getAllStudents
);

// Get single student
router.get(
  '/:id',
  authenticateToken,
  requireAdmin,
  getStudentById
);

module.exports = router;