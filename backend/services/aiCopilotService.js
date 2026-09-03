const prisma = require("../config/prisma");

/**
 * Generates context-aware, database-grounded Copilot responses for students.
 */
const generateCopilotResponse = async (userId, userMessage) => {
  if (!userMessage) {
    return {
      reply: "Hello! I am your AI Campus Copilot. Ask me about upcoming events, your skills, achievements, or recommendations.",
      suggestedActions: [],
    };
  }

  // 1. Fetch live student context from PostgreSQL
  const student = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentSkills: { include: { skill: true } },
      achievements: { include: { achievement: true } },
      registrations: {
        include: {
          event: true,
        },
      },
      credentials: true,
    },
  });

  if (!student) {
    return {
      reply: "Please log in to receive personalized campus copilot recommendations.",
      suggestedActions: [{ label: "Login", link: "/login" }],
    };
  }

  // 2. Fetch upcoming campus events
  const upcomingEvents = await prisma.event.findMany({
    where: {
      status: { in: ["UPCOMING", "PUBLISHED", "REGISTRATION"] },
      eventDate: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
    },
    take: 6,
    orderBy: { eventDate: "asc" },
  });

  const msg = userMessage.toLowerCase();
  const studentSkillsList = student.studentSkills.map((s) => s.skill.name);
  const studentDept = student.department || "Engineering";

  // Intent A: Event Discovery & Weekly Recommendations
  if (msg.includes("event") || msg.includes("recommend") || msg.includes("attend") || msg.includes("this week") || msg.includes("upcoming")) {
    if (upcomingEvents.length === 0) {
      return {
        reply: `Hi ${student.fullName}! There are no upcoming events scheduled at this moment. Check back soon for new campus announcements.`,
        suggestedActions: [
          { label: "View Calendar", link: "/calendar" },
          { label: "Announcements", link: "/announcements" },
        ],
      };
    }

    const recs = upcomingEvents.map((e) => {
      const matchReason = e.description?.toLowerCase().includes(studentDept.toLowerCase())
        ? `Aligns with your ${studentDept} curriculum`
        : `Boosts your technical portfolio and awards +50 XP`;
      return `• **${e.title}** (${e.category || "Workshop"}) — ${new Date(e.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${e.venue}. _${matchReason}_`;
    }).join("\n");

    return {
      reply: `Here are the top campus events curated for your profile (${studentDept}, Level ${student.level}):\n\n${recs}\n\nWould you like me to guide you to the registration portal?`,
      suggestedActions: [
        { label: "Explore All Events", link: "/student-events" },
        { label: "View Event Calendar", link: "/calendar" },
      ],
    };
  }

  // Intent B: Skill Improvement & Gaps
  if (msg.includes("skill") || msg.includes("python") || msg.includes("react") || msg.includes("improve") || msg.includes("develop")) {
    const skillsSummary = student.studentSkills.length > 0
      ? student.studentSkills.map((s) => `• **${s.skill.name}**: ${s.proficiency} (${s.score}%) with ${s.evidenceCount} verified evidence items`).join("\n")
      : "You haven't earned skill evidence yet. Attend workshops and hackathons to build your verified skill graph!";

    // Find matching event for skill
    const matchingEvent = upcomingEvents.find((e) =>
      msg.split(" ").some((word) => word.length > 3 && (e.title.toLowerCase().includes(word) || e.description.toLowerCase().includes(word)))
    );

    let eventTip = "";
    if (matchingEvent) {
      eventTip = `\n\n🎯 Recommended for your skills: Check out **${matchingEvent.title}** on ${new Date(matchingEvent.eventDate).toLocaleDateString()}!`;
    }

    return {
      reply: `Here is your current Verified Skill Graph breakdown:\n\n${skillsSummary}${eventTip}`,
      suggestedActions: [
        { label: "Open Skill Graph", link: "/skills" },
        { label: "View Campus Passport", link: "/passport" },
      ],
    };
  }

  // Intent C: Achievements & Semester Summary
  if (msg.includes("achieve") || msg.includes("semester") || msg.includes("progress") || msg.includes("xp") || msg.includes("level") || msg.includes("badge")) {
    const attendedCount = student.registrations.filter((r) => r.attended).length;
    const credCount = student.credentials.filter((c) => c.status === "VALID").length;
    const achList = student.achievements.map((a) => `• 🏆 **${a.achievement.name}** (${a.achievement.rarity}) — +${a.achievement.xpReward} XP`).join("\n");

    return {
      reply: `Here is your verified academic achievement summary, ${student.fullName}:\n\n` +
        `• **Current Level**: Level ${student.level} (${student.xp} Total XP)\n` +
        `• **Verified Events Attended**: ${attendedCount} events\n` +
        `• **Verifiable Credentials**: ${credCount} issued\n` +
        `• **Unlocked Achievements**:\n${achList || "• No achievements unlocked yet. Attend your next event to unlock 'First Step'!"}`,
      suggestedActions: [
        { label: "View Campus Passport", link: "/passport" },
        { label: "Campus Leaderboard", link: "/leaderboard" },
      ],
    };
  }

  // Intent D: Credential & Passport Inquiries
  if (msg.includes("passport") || msg.includes("certificate") || msg.includes("credential") || msg.includes("recruiter") || msg.includes("share")) {
    return {
      reply: `Your **Campus Passport** is active and verified by CampusConnect! It securely bundles your verified skill graph, credentials, achievements, and attendance proof. You can share your public passport link or QR code directly with recruiters.`,
      suggestedActions: [
        { label: "Open My Passport", link: "/passport" },
        { label: "Public Portfolio", link: `/portfolio/${student.username || "me"}` },
      ],
    };
  }

  // Fallback: General Campus AI Guidance
  return {
    reply: `Hello ${student.fullName}! I am your AI Campus Copilot. I can help you with:\n\n` +
      `1. **Event Recommendations**: "What workshops should I attend this week?"\n` +
      `2. **Skill Tracking**: "What skills am I developing?"\n` +
      `3. **Achievements**: "What have I achieved this semester?"\n` +
      `4. **Campus Passport**: "How do I share my credentials with recruiters?"`,
    suggestedActions: [
      { label: "Explore Events", link: "/student-events" },
      { label: "Campus Passport", link: "/passport" },
      { label: "Skill Graph", link: "/skills" },
    ],
  };
};

module.exports = {
  generateCopilotResponse,
};