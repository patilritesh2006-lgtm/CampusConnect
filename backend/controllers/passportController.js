const prisma = require("../config/prisma");
const { getStudentSkillGraph } = require("../services/skillService");

/**
 * Returns Campus Passport for authenticated student.
 */
const getMyPassport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const passportData = await buildPassportData(userId, false);
    return res.json({ success: true, passport: passportData });
  } catch (err) {
    next(err);
  }
};

/**
 * Returns public Campus Passport by username (Zero PII leaks & respects granular privacy).
 */
const getPublicPassport = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: "insensitive" } },
          { id: username },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Campus Passport not found.",
      });
    }

    if (!user.portfolioPublic) {
      return res.status(403).json({
        success: false,
        message: "This student has set their Campus Passport to private.",
      });
    }

    const passportData = await buildPassportData(user.id, true);
    return res.json({ success: true, passport: passportData });
  } catch (err) {
    next(err);
  }
};

/**
 * Updates student passport granular privacy & social links.
 */
const updatePassportPrivacy = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      portfolioPublic,
      privacyShowSkills,
      privacyShowCertificates,
      privacyShowAchievements,
      privacyShowEvents,
      privacyShowEmail,
      privacyShowPhone,
      bio,
      githubUrl,
      linkedinUrl,
      websiteUrl,
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        portfolioPublic: portfolioPublic !== undefined ? Boolean(portfolioPublic) : undefined,
        privacyShowSkills: privacyShowSkills !== undefined ? Boolean(privacyShowSkills) : undefined,
        privacyShowCertificates: privacyShowCertificates !== undefined ? Boolean(privacyShowCertificates) : undefined,
        privacyShowAchievements: privacyShowAchievements !== undefined ? Boolean(privacyShowAchievements) : undefined,
        privacyShowEvents: privacyShowEvents !== undefined ? Boolean(privacyShowEvents) : undefined,
        privacyShowEmail: privacyShowEmail !== undefined ? Boolean(privacyShowEmail) : undefined,
        privacyShowPhone: privacyShowPhone !== undefined ? Boolean(privacyShowPhone) : undefined,
        bio: bio !== undefined ? String(bio) : undefined,
        githubUrl: githubUrl !== undefined ? String(githubUrl) : undefined,
        linkedinUrl: linkedinUrl !== undefined ? String(linkedinUrl) : undefined,
        websiteUrl: websiteUrl !== undefined ? String(websiteUrl) : undefined,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        portfolioPublic: true,
        privacyShowSkills: true,
        privacyShowCertificates: true,
        privacyShowAchievements: true,
        privacyShowEvents: true,
        privacyShowEmail: true,
        privacyShowPhone: true,
        bio: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
      },
    });

    return res.json({ success: true, user: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Saves 3-step onboarding answers for new student.
 */
const completeOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { department, year, interests = [], careerGoals = [] } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        department: department || undefined,
        year: year ? Number(year) : undefined,
        interests: Array.isArray(interests) ? interests : [],
        careerGoals: Array.isArray(careerGoals) ? careerGoals : [],
        onboardingCompleted: true,
      },
    });

    return res.json({ success: true, message: "Onboarding completed successfully.", user: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Helper to build rich structured passport data with granular privacy enforcement.
 */
const buildPassportData = async (userId, isPublic = true) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      college: { select: { id: true, name: true, code: true, logoUrl: true } },
      achievements: {
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
      },
      credentials: {
        where: { status: "VALID" },
        include: { event: { select: { title: true, category: true } } },
        orderBy: { issueDate: "desc" },
      },
      registrations: {
        where: { attended: true },
        include: {
          event: { select: { id: true, title: true, category: true, eventDate: true, venue: true } },
          certificate: { select: { certificateCode: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      clubMemberships: {
        include: { club: { select: { id: true, name: true, category: true, logoUrl: true } } },
      },
    },
  });

  if (!user) return null;

  const skillGraph = await getStudentSkillGraph(userId);
  const clientBaseUrl = process.env.CLIENT_BASE_URL || "http://localhost:5173";
  const verificationUrl = `${clientBaseUrl}/verify/student/${user.username || user.id}`;

  // Calculate dynamic engagement score (0-100)
  const attendedCount = user.registrations.length;
  const credsCount = user.credentials.length;
  const achsCount = user.achievements.length;
  const dynamicEngagementScore = Math.min(
    98,
    Math.max(50, Math.round(50 + attendedCount * 6 + credsCount * 8 + achsCount * 4))
  );

  // Verified Experience Timeline
  const verifiedExperience = user.registrations.map((r) => ({
    id: r.id,
    eventTitle: r.event.title,
    category: r.event.category,
    eventDate: r.event.eventDate,
    venue: r.event.venue,
    role: r.role || "ATTENDEE",
    contributionHours: r.contributionHours || 2.0,
    contributionNotes: r.contributionNotes,
    certificateCode: r.certificate?.certificateCode || null,
    isAttendanceVerified: true,
  }));

  // Apply privacy filters for public view
  const showSkills = !isPublic || user.privacyShowSkills;
  const showCreds = !isPublic || user.privacyShowCertificates;
  const showAchs = !isPublic || user.privacyShowAchievements;
  const showEvents = !isPublic || user.privacyShowEvents;
  const showEmail = !isPublic || user.privacyShowEmail;

  return {
    identity: {
      fullName: user.fullName,
      username: user.username,
      department: user.department,
      year: user.year,
      bio: user.bio,
      profilePhoto: user.profilePhoto,
      portfolioPublic: user.portfolioPublic,
      institution: user.college?.name || "CampusConnect University",
      institutionCode: user.college?.code || "MAIN",
      githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl,
      websiteUrl: user.websiteUrl,
      interests: user.interests || [],
      careerGoals: user.careerGoals || [],
      ...(showEmail ? { email: user.email } : {}),
    },
    privacySettings: {
      portfolioPublic: user.portfolioPublic,
      privacyShowSkills: user.privacyShowSkills,
      privacyShowCertificates: user.privacyShowCertificates,
      privacyShowAchievements: user.privacyShowAchievements,
      privacyShowEvents: user.privacyShowEvents,
      privacyShowEmail: user.privacyShowEmail,
      privacyShowPhone: user.privacyShowPhone,
    },
    gamification: {
      xp: user.xp,
      level: user.level,
      engagementScore: dynamicEngagementScore,
      streakDays: user.streakDays || 1,
      totalEventsAttended: attendedCount,
      totalCredentialsEarned: credsCount,
      totalAchievementsUnlocked: achsCount,
      totalContributionHours: verifiedExperience.reduce((acc, e) => acc + (e.contributionHours || 0), 0),
    },
    skills: showSkills
      ? skillGraph.skills.map((s) => ({
          name: s.skill.name,
          category: s.skill.category,
          score: s.score,
          proficiency: s.proficiency,
          evidenceCount: s.evidenceCount,
          confidenceText: `${s.score}% verified proficiency based on ${s.evidenceCount} evidence items`,
          evidences: s.evidences.map((e) => ({
            sourceType: e.sourceType,
            sourceTitle: e.sourceTitle,
            createdAt: e.createdAt,
          })),
        }))
      : [],
    achievements: showAchs
      ? user.achievements.map((a) => ({
          name: a.achievement.name,
          description: a.achievement.description,
          icon: a.achievement.icon,
          rarity: a.achievement.rarity,
          xpReward: a.achievement.xpReward,
          unlockedAt: a.unlockedAt,
        }))
      : [],
    credentials: showCreds
      ? user.credentials.map((c) => ({
          credentialId: c.credentialId,
          title: c.title,
          description: c.description,
          issuerName: c.issuerName,
          issueDate: c.issueDate,
          cryptoHash: c.cryptoHash,
          eventTitle: c.event?.title,
          verifyUrl: `${clientBaseUrl}/verify/credential/${c.credentialId}`,
        }))
      : [],
    clubs: user.clubMemberships.map((cm) => ({
      clubName: cm.club.name,
      category: cm.club.category,
      role: cm.role,
      joinedAt: cm.joinedAt,
    })),
    verifiedExperience: showEvents ? verifiedExperience : [],
    recentEvents: showEvents ? user.registrations.slice(0, 10).map((r) => ({
      title: r.event.title,
      category: r.event.category,
      eventDate: r.event.eventDate,
      venue: r.event.venue,
      role: r.role,
    })) : [],
    verification: {
      isVerified: true,
      badgeText: "Verified by CampusConnect",
      verificationUrl,
      issuedAt: user.createdAt,
    },
  };
};

module.exports = {
  getMyPassport,
  getPublicPassport,
  updatePassportPrivacy,
  completeOnboarding,
};