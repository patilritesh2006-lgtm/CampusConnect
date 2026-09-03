const prisma = require("../config/prisma");

/**
 * Evaluates and records attendance fraud risk flags.
 */
const recordRiskIncident = async ({
  userId,
  eventId,
  reason,
  deviceInfo = null,
  ipAddress = null,
  severity = "MEDIUM",
}) => {
  if (!userId || !eventId) return null;

  // Check recent failed attempts for this user & event in last 5 minutes
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentAttempts = await prisma.attendanceRisk.count({
    where: {
      userId,
      eventId,
      createdAt: { gte: fiveMinsAgo },
    },
  });

  let riskScore = 40;
  let riskLevel = severity;

  if (recentAttempts >= 3 || severity === "HIGH") {
    riskScore = Math.min(95, 60 + (recentAttempts + 1) * 10);
    riskLevel = "HIGH";
  } else if (recentAttempts >= 1 || severity === "MEDIUM") {
    riskScore = 55;
    riskLevel = "MEDIUM";
  } else {
    riskScore = 25;
    riskLevel = "LOW";
  }

  const riskIncident = await prisma.attendanceRisk.create({
    data: {
      userId,
      eventId,
      riskScore,
      riskLevel,
      reason,
      deviceInfo,
      ipAddress,
      attemptCount: recentAttempts + 1,
      reviewStatus: "PENDING",
    },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, department: true },
      },
      event: {
        select: { id: true, title: true, eventDate: true },
      },
    },
  });

  return riskIncident;
};

/**
 * Returns fraud incidents for admin review console.
 */
const getFraudIncidents = async ({ collegeId, riskLevel, reviewStatus }) => {
  const where = {};
  if (riskLevel) where.riskLevel = riskLevel;
  if (reviewStatus) where.reviewStatus = reviewStatus;
  if (collegeId) {
    where.event = { collegeId };
  }

  const incidents = await prisma.attendanceRisk.findMany({
    where,
    include: {
      user: {
        select: { id: true, fullName: true, email: true, username: true, department: true },
      },
      event: {
        select: { id: true, title: true, venue: true, eventDate: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return incidents;
};

/**
 * Admin resolves a fraud incident flag.
 */
const resolveIncident = async (incidentId, newStatus) => {
  const incident = await prisma.attendanceRisk.update({
    where: { id: incidentId },
    data: { reviewStatus: newStatus },
  });
  return incident;
};

module.exports = {
  recordRiskIncident,
  getFraudIncidents,
  resolveIncident,
};