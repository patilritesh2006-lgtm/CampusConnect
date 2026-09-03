const crypto = require("crypto");
const prisma = require("../config/prisma");
const { addSkillEvidence } = require("./skillService");
const { evaluateAndUnlockAchievements } = require("./achievementService");

const CRED_SECRET = process.env.JWT_SECRET || "campusconnect_credential_verification_secret_key";

/**
 * Issues a cryptographically verified credential to a student.
 */
const issueCredential = async ({
  collegeId,
  userId,
  eventId,
  title,
  description,
  issuerName = "CampusConnect Institutional Authority",
  metadata = {},
  skills = [],
}) => {
  // 1. Generate unique human-readable ID
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  const credentialId = `CRED-2026-${timestamp}-${randomSuffix}`;

  const issueDate = new Date();

  // 2. Generate SHA-256 cryptographic proof hash
  const hashPayload = `${credentialId}:${userId}:${collegeId}:${issueDate.toISOString()}:${CRED_SECRET}`;
  const cryptoHash = crypto.createHash("sha256").update(hashPayload).digest("hex");

  // 3. Create Credential Record
  const credential = await prisma.credential.create({
    data: {
      credentialId,
      collegeId,
      userId,
      eventId: eventId || null,
      title,
      description,
      issuerName,
      issueDate,
      cryptoHash,
      status: "VALID",
      metadata,
    },
    include: {
      college: true,
      user: {
        select: { id: true, fullName: true, email: true, username: true, department: true },
      },
      event: true,
    },
  });

  // 4. Attach Skill Evidence for associated skills
  if (Array.isArray(skills)) {
    for (const skillName of skills) {
      await addSkillEvidence(userId, skillName, {
        sourceType: "CREDENTIAL",
        sourceTitle: title,
        sourceId: credentialId,
        weightPoints: 25,
      });
    }
  }

  // 5. Award Student XP (+100 XP) and check achievements
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const newXp = user.xp + 100;
    const newLevel = Math.floor(newXp / 200) + 1;
    await prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel },
    });
  }

  await evaluateAndUnlockAchievements(userId);

  // 6. Create in-app Notification
  await prisma.notification.create({
    data: {
      userId,
      title: "🎓 Verifiable Credential Issued!",
      message: `Your credential "${title}" has been cryptographically certified by ${issuerName}.`,
      type: "CERTIFICATE",
      link: `/verify/credential/${credentialId}`,
    },
  });

  return credential;
};

/**
 * Publicly verifies a credential by credentialId.
 */
const verifyCredential = async (credentialId) => {
  if (!credentialId) {
    return { valid: false, status: "NOT_FOUND", message: "Credential ID required." };
  }

  const cred = await prisma.credential.findUnique({
    where: { credentialId: credentialId.trim() },
    include: {
      college: {
        select: { id: true, name: true, code: true, domain: true, logoUrl: true },
      },
      user: {
        select: { id: true, fullName: true, username: true, department: true, year: true },
      },
      event: {
        select: { id: true, title: true, category: true, eventDate: true },
      },
    },
  });

  if (!cred) {
    return {
      valid: false,
      status: "NOT_FOUND",
      message: "Credential does not exist in the institutional registry.",
    };
  }

  const clientBaseUrl = process.env.CLIENT_BASE_URL || "http://localhost:5173";
  const verifyUrl = `${clientBaseUrl}/verify/credential/${cred.credentialId}`;

  const linkedInParams = new URLSearchParams({
    name: cred.title,
    organizationName: cred.college?.name || "CampusConnect",
    issueYear: new Date(cred.issueDate).getFullYear().toString(),
    issueMonth: (new Date(cred.issueDate).getMonth() + 1).toString(),
    certUrl: verifyUrl,
    certId: cred.credentialId,
  });
  const linkedInShareUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&${linkedInParams.toString()}`;

  if (cred.status === "REVOKED") {
    return {
      valid: false,
      status: "REVOKED",
      revokedAt: cred.revokedAt,
      revocationReason: cred.revocationReason || "Revoked by institutional administrator.",
      credential: {
        credentialId: cred.credentialId,
        title: cred.title,
        recipientName: cred.user?.fullName,
        issuerName: cred.issuerName,
        issueDate: cred.issueDate,
        college: cred.college,
      },
    };
  }

  return {
    valid: true,
    status: "VALID",
    credential: {
      credentialId: cred.credentialId,
      title: cred.title,
      description: cred.description,
      recipientName: cred.user?.fullName,
      recipientUsername: cred.user?.username,
      recipientDepartment: cred.user?.department,
      issuerName: cred.issuerName,
      issueDate: cred.issueDate,
      cryptoHash: cred.cryptoHash,
      college: cred.college,
      event: cred.event,
      linkedInShareUrl,
    },
  };
};

/**
 * Revokes a credential.
 */
const revokeCredential = async (credentialId, reason) => {
  const cred = await prisma.credential.findUnique({
    where: { credentialId },
  });

  if (!cred) {
    throw new Error("Credential not found.");
  }

  const updated = await prisma.credential.update({
    where: { credentialId },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
      revocationReason: reason || "Administrative revocation.",
    },
  });

  // Notify student
  await prisma.notification.create({
    data: {
      userId: cred.userId,
      title: "⚠️ Credential Revocation Notice",
      message: `Your credential "${cred.title}" (${cred.credentialId}) was revoked: ${reason || "No reason specified."}`,
      type: "ALERT",
      link: "/passport",
    },
  });

  return updated;
};

module.exports = {
  issueCredential,
  verifyCredential,
  revokeCredential,
};