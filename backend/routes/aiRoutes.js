const express = require('express');
const router = express.Router();

const { getRecommendations, askAssistant } = require('../controllers/aiController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// AI Event Recommendations
router.get('/recommendations', authenticateToken, requireRole('STUDENT'), getRecommendations);

// AI Campus Assistant
router.post('/assistant', authenticateToken, requireRole('STUDENT', 'FACULTY', 'EVENT_COORDINATOR', 'ADMIN', 'SUPER_ADMIN'), askAssistant);

module.exports = router;
