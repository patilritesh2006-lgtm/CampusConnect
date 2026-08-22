const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

router.put("/:eventId/user/:userId", authenticateToken, requireAdmin, attendanceController.toggleAttendance);
router.post("/:eventId/bulk", authenticateToken, requireAdmin, attendanceController.bulkMarkAttendance);

module.exports = router;
