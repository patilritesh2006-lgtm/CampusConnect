const prisma = require("../config/prisma");
const { generateCopilotResponse } = require("../services/aiCopilotService");
const { generateEventDraft } = require("../services/aiEventCreatorService");

// ======================================================
// 1. AI COPILOT 2.0 (Phase 6)
// ======================================================
const handleCopilotQuery = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const response = await generateCopilotResponse(userId, message);
    return res.json({ success: true, ...response });
  } catch (err) {
    next(err);
  }
};

// ======================================================
// 2. AI EVENT CREATOR DRAFT GENERATOR (Phase 7)
// ======================================================
const handleEventDraft = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required." });
    }
    const result = await generateEventDraft(prompt);
    return res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// ======================================================
// 3. LEGACY RECOMMENDATIONS & ASSISTANT (Backward Compatibility)
// ======================================================
const getEventRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        registrations: { include: { event: true } },
        studentSkills: { include: { skill: true } },
      },
    });

    const upcomingEvents = await prisma.event.findMany({
      where: {
        status: { in: ["UPCOMING", "PUBLISHED", "REGISTRATION"] },
        eventDate: { gte: new Date() },
      },
      include: {
        college: { select: { name: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { eventDate: "asc" },
      take: 10,
    });

    const studentSkills = (student?.studentSkills || []).map((s) => s.skill.name.toLowerCase());
    const studentDept = (student?.department || "").toLowerCase();

    const scoredEvents = upcomingEvents.map((event) => {
      let matchScore = 55;
      const matchReasons = [];

      const eventTitle = event.title.toLowerCase();
      const eventDesc = event.description.toLowerCase();

      if (studentDept && (eventTitle.includes(studentDept) || eventDesc.includes(studentDept))) {
        matchScore += 20;
        matchReasons.push(`Relevant to your ${student.department} department`);
      }

      studentSkills.forEach((skill) => {
        if (eventTitle.includes(skill) || eventDesc.includes(skill)) {
          matchScore += 15;
          matchReasons.push(`Matches your ${skill} skill competency`);
        }
      });

      matchScore = Math.min(98, Math.max(50, matchScore));

      return {
        ...event,
        matchScore,
        matchReasons: matchReasons.length > 0 ? matchReasons : ["Recommended for campus career advancement"],
      };
    });

    scoredEvents.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({ success: true, recommendations: scoredEvents });
  } catch (err) {
    next(err);
  }
};

const handleAssistantQuery = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const response = await generateCopilotResponse(userId, message);
    return res.json({ success: true, ...response });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleCopilotQuery,
  handleEventDraft,
  getEventRecommendations,
  handleAssistantQuery,
};