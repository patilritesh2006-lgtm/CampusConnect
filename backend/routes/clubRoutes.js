const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getClubs,
  createClub,
  getClubDetails,
  joinClub,
  leaveClub,
} = require("../controllers/clubController");

router.get("/", authenticateToken, getClubs);
router.post("/", authenticateToken, createClub);
router.get("/:id", authenticateToken, getClubDetails);
router.post("/:id/join", authenticateToken, joinClub);
router.post("/:id/leave", authenticateToken, leaveClub);

module.exports = router;