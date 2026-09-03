const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const {
  getInstitutions,
  getCurrentInstitution,
  updateInstitutionSettings,
} = require("../controllers/institutionController");

router.get("/", authenticateToken, getInstitutions);
router.get("/current", authenticateToken, requireTenant, getCurrentInstitution);
router.put("/current", authenticateToken, requireAdmin, requireTenant, updateInstitutionSettings);

module.exports = router;