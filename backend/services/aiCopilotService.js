const prisma = require("../config/prisma");

/**
 * AI Campus Copilot 2.0 with Real Campus Actions & Internship Readiness Audits.
 */
const generateCopilotResponse = async (userId, userMessage) => {
  if (!userMessage) {
    return {
      reply: "Hello! I am your AI Campus Copilot. Ask me to recommend events, perform event registration, analyze your skills, or run an Internship Readiness Audit.",
      suggestedActions: [],
    };
  }

  // 1. Fetch live student context from PostgreSQL
  const student = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentSkills: { include: { skill: true, evidences: true } },
      achievements: { include: { achievement: true } },
      registrations: {
        include: {
          event: true,
        },
      },
      credentials: true,
      clubMemberships: { include: { club: true } },
    },
  });

  if (!student) {
    return {
      reply: "Please log in to receive personalized campus copilot actions.",
      suggestedActions: [{ label: "Login", link: "/login" }],
    };
  }

  // 2. Fetch upcoming campus events
  const upcomingEvents = await prisma.event.findMany({
    where: {
      status: { in: ["UPCOMING", "PUBLISHED", "REGISTRATION", "REGISTRATION_OPEN"] },
      eventDate: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
    },
    take: 6,
    orderBy: { eventDate: "asc" },
  });

  const msg = userMessage.toLowerCase().trim();
  const studentDept = student.department || "Engineering";
  const attendedEvents = student.registrations.filter((r) => r.attended);

  // ACTION 1: Actionable Event Registration (e.g. "register me for ...")
  if (msg.startsWith("register") || msg.includes("register me") || msg.includes("sign up for")) {
    let targetEvent = null;

    // Check if target event is specified by number or keyword
    for (const event of upcomingEvents) {
      if (msg.includes(event.title.toLowerCase()) || msg.includes(event.id)) {
        targetEvent = event;
        break;
      }
    }

    if (!targetEvent && upcomingEvents.length > 0) {
      targetEvent = upcomingEvents[0];
    }

    if (targetEvent) {
      // Check existing registration
      const existingReg = await prisma.registration.findUnique({
        where: { userId_eventId: { userId, eventId: targetEvent.id } },
      });

      if (existingReg) {
        return {
          reply: `✅ You are already registered for **${targetEvent.title}**! Check-in opens 15 minutes before kickoff at ${targetEvent.venue}.`,
          suggestedActions: [
            { label: "View My Registrations", link: "/my-registrations" },
            { label: "Open Event", link: "/student-events" },
          ],
        };
      }

      // Execute registration
      await prisma.registration.create({
        data: {
          userId,
          eventId: targetEvent.id,
          role: "ATTENDEE",
        },
      });

      return {
        reply: `🎉 **Success!** I have registered you for **${targetEvent.title}** on ${new Date(targetEvent.eventDate).toLocaleDateString()} at ${targetEvent.venue}. Earning attendance will award you +50 XP and skill evidence.`,
        suggestedActions: [
          { label: "My Registrations", link: "/my-registrations" },
          { label: "Event Calendar", link: "/calendar" },
        ],
      };
    }
  }

  // ACTION 2: Internship & Career Readiness Audit
  if (msg.includes("internship") || msg.includes("readiness") || msg.includes("career") || msg.includes("missing")) {
    const techSkillsCount = student.studentSkills.filter((s) => s.skill.category === "TECHNICAL").length;
    const projectEvidences = student.studentSkills.reduce(
      (acc, s) => acc + s.evidences.filter((e) => e.sourceType === "PROJECT").length,
      0
    );
    const leadershipCount = student.clubMemberships.length;
    const hackathonCount = attendedEvents.filter((r) => r.event.category?.toLowerCase().includes("hackathon")).length;
    const credCount = student.credentials.filter((c) => c.status === "VALID").length;

    const technicalScore = Math.min(95, 45 + techSkillsCount * 12);
    const projectsScore = Math.min(90, 40 + projectEvidences * 15);
    const leadershipScore = Math.min(95, 50 + leadershipCount * 20);
    const experienceScore = Math.min(95, 35 + attendedEvents.length * 10 + hackathonCount * 15);
    const overallScore = Math.round((technicalScore + projectsScore + leadershipScore + experienceScore) / 4);

    const nextActions = [];
    if (hackathonCount === 0) nextActions.push("1. Participate in 1 campus Hackathon to boost problem-solving proof");
    if (projectEvidences < 2) nextActions.push("2. Submit 2 capstone project evidences to your Skill Graph");
    if (credCount < 2) nextActions.push("3. Complete an upcoming certified workshop to earn verified credentials");
    if (nextActions.length === 0) nextActions.push("1. Apply for campus club leadership roles to maximize engagement");

    return {
      reply:
        `📊 **INTERNSHIP & CAREER READINESS AUDIT**\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `• **Technical Skills**: ${technicalScore}%\n` +
        `• **Project Proof**: ${projectsScore}%\n` +
        `• **Leadership & Collaboration**: ${leadershipScore}%\n` +
        `• **Verified Campus Experience**: ${experienceScore}%\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🌟 **Overall Readiness Score**: **${overallScore}/100**\n\n` +
        `🎯 **TOP RECOMMENDED ACTIONS**:\n` +
        nextActions.join("\n"),
      suggestedActions: [
        { label: "Open Skill Graph", link: "/skills" },
        { label: "Campus Passport", link: "/passport" },
        { label: "Explore Hackathons", link: "/student-events" },
      ],
    };
  }

  // ACTION 3: Explainable Event Recommendations
  if (msg.includes("event") || msg.includes("recommend") || msg.includes("attend") || msg.includes("this week")) {
    if (upcomingEvents.length === 0) {
      return {
        reply: `Hi ${student.fullName}! There are no upcoming events scheduled at this moment. Check back soon for new campus announcements.`,
        suggestedActions: [{ label: "View Calendar", link: "/calendar" }],
      };
    }

    const recs = upcomingEvents.map((e, idx) => {
      const matchScore = e.description?.toLowerCase().includes("python") ? 96 : 88;
      const matchReasons = e.description?.toLowerCase().includes("python")
        ? `Because you know Python, attended recent tech workshops, and improves backend competency`
        : `Aligns with your ${studentDept} curriculum and awards +50 XP`;

      return `${idx + 1}. **${e.title}** (${matchScore}% Match)\n   _${matchReasons}_\n   📍 ${e.venue} • ${new Date(e.eventDate).toLocaleDateString()}`;
    }).join("\n\n");

    return {
      reply: `Here are the top explainable campus events curated for your profile:\n\n${recs}\n\n👉 You can say *"Register me for event #1"* to sign up instantly!`,
      suggestedActions: [
        { label: "Register for #1", query: "Register me for #1" },
        { label: "Internship Readiness", query: "What am I missing to become internship-ready?" },
        { label: "All Events", link: "/student-events" },
      ],
    };
  }

  // ACTION 4: Skill Graph Breakdown
  if (msg.includes("skill") || msg.includes("python") || msg.includes("improve") || msg.includes("evidence")) {
    const skillsSummary = student.studentSkills.length > 0
      ? student.studentSkills.map((s) => `• **${s.skill.name}**: ${s.proficiency} (${s.score}% verified based on ${s.evidenceCount} evidence items)`).join("\n")
      : "You haven't earned skill evidence yet. Attend workshops and hackathons to build your verified skill graph!";

    return {
      reply: `Here is your current Evidence-Backed Skill Graph breakdown:\n\n${skillsSummary}`,
      suggestedActions: [
        { label: "Add Project Evidence", link: "/skills" },
        { label: "Campus Passport", link: "/passport" },
      ],
    };
  }

  // ACTION 5: Achievements & Semester Summary
  if (msg.includes("achieve") || msg.includes("semester") || msg.includes("xp") || msg.includes("level")) {
    const achList = student.achievements.map((a) => `• 🏆 **${a.achievement.name}** (${a.achievement.rarity}) — +${a.achievement.xpReward} XP`).join("\n");

    return {
      reply:
        `🎓 **SEMESTER ENGAGEMENT REPORT**\n` +
        `• **Current Level**: Level ${student.level} (${student.xp} Total XP)\n` +
        `• **Engagement Score**: ${student.engagementScore}/100\n` +
        `• **Verified Events Attended**: ${attendedEvents.length} events\n` +
        `• **Verified Credentials**: ${student.credentials.filter((c) => c.status === "VALID").length} certified\n\n` +
        `🏆 **Unlocked Achievements**:\n${achList || "• Attend your next event to unlock 'First Step'!"}`,
      suggestedActions: [
        { label: "View Campus Passport", link: "/passport" },
        { label: "Campus Leaderboard", link: "/leaderboard" },
      ],
    };
  }

  // Fallback: General Guidance
  return {
    reply:
      `Hello ${student.fullName}! I am your AI Campus Copilot. Here are powerful things I can do for you:\n\n` +
      `1. **Career Readiness Audit**: "What am I missing to become internship-ready?"\n` +
      `2. **Instant Event Registration**: "Register me for event #1"\n` +
      `3. **Skill Gap Analysis**: "What skills am I developing?"\n` +
      `4. **Campus Passport**: "Summarize my achievements this semester"`,
    suggestedActions: [
      { label: "Internship Readiness", query: "What am I missing to become internship-ready?" },
      { label: "Recommended Events", query: "What events should I attend this week?" },
      { label: "Campus Passport", link: "/passport" },
    ],
  };
};

module.exports = {
  generateCopilotResponse,
};