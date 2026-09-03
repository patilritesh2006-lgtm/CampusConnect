const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  handleCopilotQuery,
  handleEventDraft,
  getEventRecommendations,
  handleAssistantQuery,
} = require("../controllers/aiController");

router.get("/recommendations", authenticateToken, getEventRecommendations);
router.post("/assistant", authenticateToken, handleAssistantQuery);
router.post("/copilot", authenticateToken, handleCopilotQuery);
router.post("/event-draft", authenticateToken, requireAdmin, handleEventDraft);

module.exports = router;