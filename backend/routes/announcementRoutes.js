const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { createAnnouncementSchema } = require("../validators/announcementSchemas");

// Public / Authenticated view
router.get("/", announcementController.getAnnouncements);

// Admin only
router.post("/", authenticateToken, requireAdmin, validate(createAnnouncementSchema), announcementController.createAnnouncement);
router.delete("/:id", authenticateToken, requireAdmin, announcementController.deleteAnnouncement);

module.exports = router;
