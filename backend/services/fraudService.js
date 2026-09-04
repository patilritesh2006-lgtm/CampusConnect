const prisma = require("../config/prisma");
const { logAuditEvent } = require("./auditService");

/**
 * Attendance Risk Matrix Weights
 */
const RISK_FACTORS_WEIGHTS = {
  QR_REPLAY: 30,
  MULTIPLE_ATTEMPTS: 15,
  IMPOSSIBLE_TIMING: 20,
  DEVICE_MISMATCH: 15,
  DUPLICATE_ATTENDANCE: 40,
  UNREGISTERED_ATTEMPT: 20,
};

/**
 * Evaluates multi-factor risk and logs an anomaly incident.
 */
const recordRiskIncident = async ({
  userId,
  eventId,
  reason,
  factors = ["MULTIPLE_ATTEMPTS"],
  deviceInfo = null,
  ipAddress = null,
  severity = "MEDIUM",
}) => {
  if (!userId || !eventId) return null;

  // 1. Calculate weighted multi-factor risk score
  let calculatedScore = 20;
  factors.forEach((factor) => {
    calculatedScore += RISK_FACTORS_WEIGHTS[factor] || 15;
  });

  // Check recent failed attempts in past 10 minutes
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentAttempts = await prisma.attendanceRisk.count({
    where: {
      userId,
      eventId,
      createdAt: { gte: tenMinsAgo },
    },
  });

  if (recentAttempts >= 2) {
    calculatedScore += recentAttempts * 10;
  }

  calculatedScore = Math.min(98, Math.max(15, calculatedScore));

  let riskLevel = "LOW";
  if (calculatedScore >= 70) riskLevel = "HIGH";
  else if (calculatedScore >= 45) riskLevel = "MEDIUM";

  const riskIncident = await prisma.attendanceRisk.create({
    data: {
      userId,
      eventId,
      riskScore: calculatedScore,
      riskLevel,
      reason,
      riskFactors: factors,
      deviceInfo,
      ipAddress,
      attemptCount: recentAttempts + 1,
      reviewStatus: "PENDING",
    },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, department: true, collegeId: true },
      },
      event: {
        select: { id: true, title: true, eventDate: true, collegeId: true },
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
 * Admin resolves, approves or rejects a flagged attendance risk.
 */
const resolveIncident = async (incidentId, newStatus, adminUser = null) => {
  const incident = await prisma.attendanceRisk.findUnique({
    where: { id: incidentId },
    include: { event: true },
  });

  if (!incident) {
    throw new Error("Risk incident not found.");
  }

  const updated = await prisma.attendanceRisk.update({
    where: { id: incidentId },
    data: { reviewStatus: newStatus },
  });

  // If approved by admin, verify attendance
  if (newStatus === "APPROVED" || newStatus === "RESOLVED_VALID") {
    await prisma.registration.updateMany({
      where: { userId: incident.userId, eventId: incident.eventId },
      data: { attended: true, attendanceMarkedAt: new Date(), checkinMethod: "ADMIN_OVERRIDE" },
    });
  }

  // Audit log
  if (adminUser) {
    await logAuditEvent({
      collegeId: incident.event.collegeId,
      actorId: adminUser.id,
      action: `FRAUD_ALERT_${newStatus}`,
      entity: "AttendanceRisk",
      entityId: incident.id,
      metadata: { userId: incident.userId, eventId: incident.eventId, riskScore: incident.riskScore },
    });
  }

  return updated;
};

module.exports = {
  recordRiskIncident,
  getFraudIncidents,
  resolveIncident,
};