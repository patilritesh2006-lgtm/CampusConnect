const express = require('express');
const router = express.Router();

const { submitFeedback, getEventFeedback } = require('../controllers/feedbackController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Submit feedback (Attended student)
router.post('/events/:eventId/feedback', authenticateToken, requireRole('STUDENT'), submitFeedback);

// View feedback summary
router.get('/events/:eventId/feedback', getEventFeedback);

module.exports = router;
