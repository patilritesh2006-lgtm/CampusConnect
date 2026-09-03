const prisma = require("../config/prisma");
const { issueCredential, verifyCredential, revokeCredential } = require("../services/credentialService");

const issueStudentCredential = async (req, res, next) => {
  try {
    const { userId, eventId, title, description, skills = [], issuerName, metadata } = req.body;

    if (!userId || !title) {
      return res.status(400).json({
        success: false,
        message: "User ID and credential title are required.",
      });
    }

    const collegeId = req.user.collegeId || (await prisma.college.findFirst())?.id;

    const credential = await issueCredential({
      collegeId,
      userId,
      eventId,
      title,
      description: description || `Certified mastery and verified participation in ${title}.`,
      issuerName: issuerName || req.user.fullName || "CampusConnect Authority",
      skills,
      metadata,
    });

    return res.status(201).json({ success: true, credential });
  } catch (err) {
    next(err);
  }
};

const getMyCredentials = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const credentials = await prisma.credential.findMany({
      where: { userId },
      include: {
        college: { select: { name: true, code: true } },
        event: { select: { title: true, category: true, eventDate: true } },
      },
      orderBy: { issueDate: "desc" },
    });
    return res.json({ success: true, credentials });
  } catch (err) {
    next(err);
  }
};

const verifyPublicCredential = async (req, res, next) => {
  try {
    const { credentialId } = req.params;
    const verification = await verifyCredential(credentialId);

    if (verification.status === "NOT_FOUND") {
      return res.status(404).json(verification);
    }

    return res.json(verification);
  } catch (err) {
    next(err);
  }
};

const revokeStudentCredential = async (req, res, next) => {
  try {
    const { credentialId, reason } = req.body;
    if (!credentialId) {
      return res.status(400).json({ success: false, message: "Credential ID is required." });
    }

    const revoked = await revokeCredential(credentialId, reason);
    return res.json({ success: true, credential: revoked });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  issueStudentCredential,
  getMyCredentials,
  verifyPublicCredential,
  revokeStudentCredential,
};