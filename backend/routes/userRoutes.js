const express = require('express');
const router = express.Router();

const {
  getPublicPortfolio,
  getLeaderboard,
  updateProfile,
} = require('../controllers/userController');

const { authenticateToken } = require('../middleware/authMiddleware');

// Public Student Digital Portfolio
router.get('/portfolio/:username', getPublicPortfolio);

// Gamification Leaderboard (Protected)
router.get('/leaderboard', authenticateToken, getLeaderboard);

// Update Profile & Portfolio Settings (Protected)
router.put('/profile', authenticateToken, updateProfile);

module.exports = router;
