const prisma = require("../config/prisma");

// ======================================================
// AI-POWERED EVENT RECOMMENDATIONS
// ======================================================
const getRecommendations = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Fetch student profile, past registrations, and skills
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        registrations: {
          include: { event: true },
        },
        certificates: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    // Fetch upcoming events
    const upcomingEvents = await prisma.event.findMany({
      where: {
        eventDate: { gte: new Date() },
        status: "UPCOMING",
      },
      include: {
        registrations: true,
        college: true,
      },
    });

    const registeredEventIds = new Set(student.registrations.map((r) => r.eventId));

    // Calculate category preferences from past history
    const pastCategories = {};
    student.registrations.forEach((r) => {
      const cat = r.event.category || "General";
      pastCategories[cat] = (pastCategories[cat] || 0) + 1;
    });

    const studentSkills = (student.skills || []).map((s) => s.toLowerCase());
    const studentDept = (student.department || "").toLowerCase();

    const scoredEvents = upcomingEvents.map((event) => {
      let matchScore = 50; // base score
      const matchReasons = [];

      const eventCategory = (event.category || "").toLowerCase();
      const eventTitle = event.title.toLowerCase();
      const eventDesc = event.description.toLowerCase();

      // 1. Category affinity check (+20%)
      if (pastCategories[event.category]) {
        matchScore += 20;
        matchReasons.push(`Matches your interest in ${event.category}s`);
      }

      // 2. Department relevance (+15%)
      if (studentDept && (eventDesc.includes(studentDept) || eventTitle.includes(studentDept))) {
        matchScore += 15;
        matchReasons.push(`Relevant to your ${student.department} department`);
      }

      // 3. Skills match (+15%)
      const matchedSkill = studentSkills.find((skill) =>
        eventTitle.includes(skill) || eventDesc.includes(skill)
      );
      if (matchedSkill) {
        matchScore += 15;
        matchReasons.push(`Aligns with your skill: "${matchedSkill}"`);
      }

      // 4. Fill rate / popularity boost (+10%)
      const fillRate = event.capacity ? event.registrations.length / event.capacity : 0;
      if (fillRate > 0.5) {
        matchScore += 10;
        matchReasons.push("High demand on campus");
      }

      const isRegistered = registeredEventIds.has(event.id);
      const finalScore = Math.min(99, matchScore);

      return {
        ...event,
        isRegistered,
        matchScore: finalScore,
        matchReason: matchReasons[0] || "Recommended for all students",
      };
    });

    // Sort by highest match score
    scoredEvents.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      recommendations: scoredEvents,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// AI CAMPUS ASSISTANT (Natural Language Handler)
// ======================================================
const askAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;
    const studentId = req.user.id;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const query = message.toLowerCase().trim();

    const [student, upcomingEvents] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        include: {
          registrations: { include: { event: true } },
          certificates: { include: { event: true } },
        },
      }),
      prisma.event.findMany({
        where: {
          eventDate: { gte: new Date() },
          status: "UPCOMING",
        },
        take: 5,
        orderBy: { eventDate: "asc" },
      }),
    ]);

    let reply = "";
    let suggestedLinks = [];

    if (query.includes("certificate") || query.includes("cert")) {
      const certCount = student.certificates.length;
      if (certCount === 0) {
        reply = `You haven't earned any certificates yet. Attend registered events to receive official verified certificates!`;
      } else {
        const certTitles = student.certificates.map((c) => `• ${c.event.title} (Code: ${c.certificateCode})`).join("\n");
        reply = `You have earned ${certCount} official certificate(s):\n${certTitles}\n\nYou can view and download them on your Certificates page.`;
        suggestedLinks.push({ label: "View Certificates", url: "/student-certificates" });
      }
    } else if (query.includes("attendance") || query.includes("attended")) {
      const totalReg = student.registrations.length;
      const attended = student.registrations.filter((r) => r.attended).length;
      const rate = totalReg > 0 ? Math.round((attended / totalReg) * 100) : 0;
      reply = `Your Attendance Overview:\n• Registered Events: ${totalReg}\n• Attended: ${attended}\n• Attendance Rate: ${rate}%\n• XP Level: Level ${student.level} (${student.xp} XP)`;
      suggestedLinks.push({ label: "My Registrations", url: "/my-registrations" });
    } else if (query.includes("hackathon") || query.includes("coding")) {
      const hackathons = upcomingEvents.filter((e) => (e.category || "").toLowerCase() === "hackathon");
      if (hackathons.length > 0) {
        const list = hackathons.map((h) => `• ${h.title} on ${new Date(h.eventDate).toLocaleDateString()} at ${h.venue}`).join("\n");
        reply = `Here are the upcoming hackathons:\n${list}`;
        suggestedLinks.push({ label: "Explore Events", url: "/student-events" });
      } else {
        reply = "There are no upcoming hackathons scheduled right now. Check back soon or explore our workshops!";
        suggestedLinks.push({ label: "Explore Events", url: "/student-events" });
      }
    } else if (query.includes("event") || query.includes("upcoming") || query.includes("happening") || query.includes("calendar")) {
      if (upcomingEvents.length === 0) {
        reply = "There are currently no upcoming events posted on campus.";
      } else {
        const list = upcomingEvents.map((e) => `• ${e.title} (${e.category}) - ${new Date(e.eventDate).toLocaleDateString()} @ ${e.venue}`).join("\n");
        reply = `Here are the top upcoming events on campus:\n${list}`;
        suggestedLinks.push({ label: "View All Events", url: "/student-events" });
        suggestedLinks.push({ label: "Event Calendar", url: "/calendar" });
      }
    } else if (query.includes("badge") || query.includes("xp") || query.includes("level") || query.includes("score")) {
      reply = `Your Gamification Status:\n• XP: ${student.xp} XP\n• Level: Level ${student.level}\n\nTips to earn XP:\n• Scan QR to check in (+50 XP)\n• Earn verified certificates (+100 XP)\n• Submit event feedback (+25 XP)`;
      suggestedLinks.push({ label: "My Profile & Badges", url: "/student-profile" });
    } else {
      reply = `Hello ${student.fullName}! I am your CampusConnect AI Assistant. You can ask me about:\n• Upcoming campus events & hackathons\n• Your verified certificates & ID codes\n• Your attendance rate & registered events\n• How to earn XP & level up!`;
      suggestedLinks.push({ label: "Explore Events", url: "/student-events" });
    }

    return res.status(200).json({
      success: true,
      reply,
      suggestedLinks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  askAssistant,
};
