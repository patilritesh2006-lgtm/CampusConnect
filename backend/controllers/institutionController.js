const prisma = require("../config/prisma");

const getInstitutions = async (req, res, next) => {
  try {
    const institutions = await prisma.college.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        email: true,
        domain: true,
        logoUrl: true,
        address: true,
        status: true,
        createdAt: true,
        _count: { select: { users: true, events: true, clubs: true } },
      },
    });
    return res.json({ success: true, institutions });
  } catch (err) {
    next(err);
  }
};

const getCurrentInstitution = async (req, res, next) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      return res.status(404).json({ success: false, message: "No institution linked." });
    }
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      include: {
        _count: { select: { users: true, events: true, clubs: true } },
      },
    });
    return res.json({ success: true, institution: college });
  } catch (err) {
    next(err);
  }
};

const updateInstitutionSettings = async (req, res, next) => {
  try {
    const collegeId = req.user?.collegeId;
    const { name, domain, address, logoUrl, settings } = req.body;

    const updated = await prisma.college.update({
      where: { id: collegeId },
      data: {
        name: name || undefined,
        domain: domain || undefined,
        address: address || undefined,
        logoUrl: logoUrl || undefined,
        settings: settings || undefined,
      },
    });
    return res.json({ success: true, institution: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInstitutions,
  getCurrentInstitution,
  updateInstitutionSettings,
};