const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  issueStudentCredential,
  getMyCredentials,
  verifyPublicCredential,
  revokeStudentCredential,
} = require("../controllers/credentialController");

router.post("/issue", authenticateToken, requireAdmin, issueStudentCredential);
router.post("/revoke", authenticateToken, requireAdmin, revokeStudentCredential);
router.get("/my-credentials", authenticateToken, getMyCredentials);

// Public verification endpoint
router.get("/verify/:credentialId", verifyPublicCredential);

module.exports = router;