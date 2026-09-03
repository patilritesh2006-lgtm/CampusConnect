const prisma = require("../config/prisma");

const getClubs = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;
    const userId = req.user.id;

    const clubs = await prisma.club.findMany({
      where: req.user.role === "SUPER_ADMIN" ? {} : { collegeId },
      include: {
        _count: { select: { members: true, events: true } },
        members: {
          where: { userId },
          select: { role: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = clubs.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      description: c.description,
      category: c.category,
      logoUrl: c.logoUrl,
      coverUrl: c.coverUrl,
      memberCount: c._count.members,
      eventCount: c._count.events,
      myRole: c.members[0]?.role || null,
      isMember: c.members.length > 0,
    }));

    return res.json({ success: true, clubs: formatted });
  } catch (err) {
    next(err);
  }
};

const createClub = async (req, res, next) => {
  try {
    const { name, code, description, category, logoUrl, coverUrl } = req.body;
    const collegeId = req.user.collegeId || (await prisma.college.findFirst())?.id;

    if (!name || !code || !description) {
      return res.status(400).json({
        success: false,
        message: "Club name, code, and description are required.",
      });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await prisma.club.findFirst({
      where: { collegeId, code: cleanCode },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A club with this code already exists for this institution.",
      });
    }

    const club = await prisma.club.create({
      data: {
        collegeId,
        name,
        code: cleanCode,
        description,
        category: category || "TECHNICAL",
        logoUrl,
        coverUrl,
        members: {
          create: {
            userId: req.user.id,
            role: "CLUB_ADMIN",
          },
        },
      },
    });

    return res.status(201).json({ success: true, club });
  } catch (err) {
    next(err);
  }
};

const getClubDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, username: true, department: true, profilePhoto: true },
            },
          },
        },
        events: {
          orderBy: { eventDate: "asc" },
        },
        announcements: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found." });
    }

    return res.json({ success: true, club });
  } catch (err) {
    next(err);
  }
};

const joinClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId: id, userId } },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Already a member of this club." });
    }

    const member = await prisma.clubMember.create({
      data: {
        clubId: id,
        userId,
        role: "MEMBER",
      },
      include: { club: true },
    });

    return res.status(201).json({ success: true, message: `Joined ${member.club.name}!`, member });
  } catch (err) {
    next(err);
  }
};

const leaveClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.clubMember.deleteMany({
      where: { clubId: id, userId },
    });

    return res.json({ success: true, message: "Left the club successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getClubs,
  createClub,
  getClubDetails,
  joinClub,
  leaveClub,
};