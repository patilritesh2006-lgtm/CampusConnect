const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController");
const { authenticateToken, requireAdmin, requireStudent } = require("../middleware/authMiddleware");

// Public verification
router.get("/verify/:code", certificateController.verifyCertificate);

// Student
router.get("/my", authenticateToken, requireStudent, certificateController.getMyCertificates);

// Admin
router.get("/all", authenticateToken, requireAdmin, certificateController.getAllCertificates);
router.post("/generate", authenticateToken, requireAdmin, certificateController.generateCertificate);

module.exports = router;
