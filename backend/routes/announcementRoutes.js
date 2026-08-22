const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

// Public / Authenticated view
router.get("/", announcementController.getAnnouncements);

// Admin only
router.post("/", authenticateToken, requireAdmin, announcementController.createAnnouncement);
router.delete("/:id", authenticateToken, requireAdmin, announcementController.deleteAnnouncement);

module.exports = router;
