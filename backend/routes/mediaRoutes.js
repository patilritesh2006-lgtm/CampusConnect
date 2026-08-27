const express = require('express');
const router = express.Router();

const { addEventMedia, getEventMedia } = require('../controllers/mediaController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// View gallery (Public)
router.get('/events/:eventId/media', getEventMedia);

// Upload / Add media (Admin / Faculty / Coordinator)
router.post(
  '/events/:eventId/media',
  authenticateToken,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'EVENT_COORDINATOR'),
  addEventMedia
);

module.exports = router;
