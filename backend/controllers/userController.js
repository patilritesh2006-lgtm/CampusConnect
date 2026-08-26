const prisma = require("../config/prisma");

// ======================================================
// GET PUBLIC STUDENT DIGITAL PORTFOLIO (No sensitive PII)
// ======================================================
const getPublicPortfolio = async (req, res, next) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    const student = await prisma.user.findFirst({
      where: {
        username: { equals: username.trim(), mode: "insensitive" },
        role: "STUDENT",
      },
      select: {
        id: true,
        fullName: true,
        department: true,
        year: true,
        bio: true,
        skills: true,
        xp: true,
        level: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        portfolioPublic: true,
        createdAt: true,
        certificates: {
          select: {
            id: true,
            certificateCode: true,
            issueDate: true,
            event: {
              select: {
                id: true,
                title: true,
                category: true,
                eventDate: true,
              },
            },
          },
          orderBy: { issueDate: "desc" },
        },
        registrations: {
          where: { attended: true },
          select: {
            id: true,
            attendanceMarkedAt: true,
            event: {
              select: {
                id: true,
                title: true,
                category: true,
                eventDate: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student portfolio not found.",
      });
    }

    if (!student.portfolioPublic) {
      return res.status(403).json({
        success: false,
        message: "This student's portfolio is set to private.",
      });
    }

    // Compute Badges
    const totalAttended = student.registrations.length;
    const totalCertificates = student.certificates.length;

    const badges = [
      {
        id: "active-participant",
        name: "Active Participant",
        description: "Registered & attended campus activities",
        unlocked: totalAttended >= 1,
        icon: "🎯",
      },
      {
        id: "event-explorer",
        name: "Event Explorer",
        description: "Participated in 3+ college events",
        unlocked: totalAttended >= 3,
        icon: "🚀",
      },
      {
        id: "event-champion",
        name: "Campus Champion",
        description: "Attended 5+ campus events",
        unlocked: totalAttended >= 5,
        icon: "🥇",
      },
      {
        id: "certified-scholar",
        name: "Certified Scholar",
        description: "Earned official verified certificates",
        unlocked: totalCertificates >= 1,
        icon: "📜",
      },
      {
        id: "master-achiever",
        name: "Master Achiever",
        description: "Reached Level 5+ in CampusConnect",
        unlocked: student.level >= 5,
        icon: "⭐",
      },
    ];

    return res.status(200).json({
      success: true,
      portfolio: {
        fullName: student.fullName,
        department: student.department || "Student",
        year: student.year,
        bio: student.bio || "Active CampusConnect student community member.",
        skills: student.skills || [],
        xp: student.xp,
        level: student.level,
        githubUrl: student.githubUrl,
        linkedinUrl: student.linkedinUrl,
        websiteUrl: student.websiteUrl,
        memberSince: student.createdAt,
        totalEventsAttended: totalAttended,
        totalCertificatesEarned: totalCertificates,
        attendedEvents: student.registrations.map((r) => r.event),
        certificates: student.certificates,
        badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET CAMPUS XP LEADERBOARD (Phase 12 Gamification)
// ======================================================
const getLeaderboard = async (req, res, next) => {
  try {
    const topStudents = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        fullName: true,
        department: true,
        xp: true,
        level: true,
        username: true,
        registrations: { where: { attended: true } },
        certificates: true,
      },
      orderBy: [{ xp: "desc" }, { level: "desc" }],
      take: 20,
    });

    const leaderboard = topStudents.map((s, index) => ({
      rank: index + 1,
      id: s.id,
      fullName: s.fullName,
      username: s.username,
      department: s.department || "General",
      xp: s.xp,
      level: s.level,
      attendedCount: s.registrations.length,
      certificatesCount: s.certificates.length,
    }));

    return res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE STUDENT PROFILE & PORTFOLIO SETTINGS
// ======================================================
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      department,
      year,
      username,
      bio,
      skills,
      githubUrl,
      linkedinUrl,
      websiteUrl,
      portfolioPublic,
    } = req.body;

    // If username is provided, check uniqueness
    if (username) {
      const cleanUsername = username.trim().toLowerCase();
      const existingUser = await prisma.user.findFirst({
        where: {
          username: cleanUsername,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken. Please choose another.",
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName: fullName.trim() }),
        ...(department !== undefined && { department: department?.trim() || null }),
        ...(year !== undefined && { year: year ? parseInt(year, 10) : null }),
        ...(username && { username: username.trim().toLowerCase() }),
        ...(bio !== undefined && { bio: bio?.trim() || null }),
        ...(skills !== undefined && { skills: Array.isArray(skills) ? skills : [] }),
        ...(githubUrl !== undefined && { githubUrl: githubUrl?.trim() || null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl?.trim() || null }),
        ...(websiteUrl !== undefined && { websiteUrl: websiteUrl?.trim() || null }),
        ...(portfolioPublic !== undefined && { portfolioPublic: Boolean(portfolioPublic) }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        year: true,
        username: true,
        bio: true,
        skills: true,
        xp: true,
        level: true,
        portfolioPublic: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        role: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicPortfolio,
  getLeaderboard,
  updateProfile,
};
