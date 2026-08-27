const express = require('express');
const router = express.Router();

const {
  getRotatingQR,
  checkInQR,
  markAttendance,
  markAllAttended,
  exportCSV,
} = require('../controllers/attendanceController');

const {
  authenticateToken,
  requireRole,
} = require('../middleware/authMiddleware');

// Student QR Scan Check-In
router.post('/checkin-qr', authenticateToken, requireRole('STUDENT'), checkInQR);

// Organizer / Admin / Faculty / Coordinator - Live Rotating QR
router.get(
  '/events/:eventId/rotating-qr',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'EVENT_COORDINATOR'),
  getRotatingQR
);

// Toggle Single Attendance
router.post(
  '/mark',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'EVENT_COORDINATOR'),
  markAttendance
);

// Bulk Check-in
router.post(
  '/mark-all',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'EVENT_COORDINATOR'),
  markAllAttended
);

// Export CSV Roster
router.get(
  '/events/:eventId/export-csv',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'EVENT_COORDINATOR'),
  exportCSV
);

module.exports = router;
