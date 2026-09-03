const prisma = require("../config/prisma");
const { generateEventQRToken, verifyEventQRToken } = require("../utils/qrService");
const { recordRiskIncident } = require("../services/fraudService");
const { addSkillEvidence } = require("../services/skillService");
const { evaluateAndUnlockAchievements } = require("../services/achievementService");

// ======================================================
// GET ROTATING QR FOR EVENT (Admin / Coordinator)
// ======================================================
const getRotatingQR = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, status: true, venue: true },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const qrData = generateEventQRToken(eventId);

    return res.status(200).json({
      success: true,
      event,
      ...qrData,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// STUDENT QR CHECK-IN (With Fraud Logging & Skill Evidence)
// ======================================================
const checkInQR = async (req, res, next) => {
  try {
    const { eventId, qrToken } = req.body;
    const studentId = req.user.id;

    if (!eventId || !qrToken) {
      return res.status(400).json({
        success: false,
        message: "Event ID and QR token are required.",
      });
    }

    // 1. Verify Rotating QR Token Signature and Expiry
    const tokenCheck = verifyEventQRToken(eventId, qrToken);
    if (!tokenCheck.valid) {
      // Record Attendance Risk Anomaly
      await recordRiskIncident({
        userId: studentId,
        eventId,
        reason: `Invalid or expired QR scan attempt: ${tokenCheck.message}`,
        deviceInfo: req.headers["user-agent"] || null,
        ipAddress: req.ip || null,
        severity: "MEDIUM",
      });

      return res.status(400).json({
        success: false,
        message: tokenCheck.message,
      });
    }

    // 2. Verify Event Status
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    if (event.status === "COMPLETED" || event.status === "CANCELLED" || event.status === "ARCHIVED") {
      return res.status(400).json({
        success: false,
        message: `Check-in closed. Event is marked as ${event.status}.`,
      });
    }

    // 3. Find Student Registration
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: studentId,
          eventId,
        },
      },
    });

    if (!registration) {
      await recordRiskIncident({
        userId: studentId,
        eventId,
        reason: "Unregistered student attempted attendance check-in.",
        deviceInfo: req.headers["user-agent"] || null,
        ipAddress: req.ip || null,
        severity: "LOW",
      });

      return res.status(404).json({
        success: false,
        message: "You are not registered for this event.",
      });
    }

    if (registration.attended) {
      await recordRiskIncident({
        userId: studentId,
        eventId,
        reason: "Duplicate QR scan check-in attempted.",
        deviceInfo: req.headers["user-agent"] || null,
        ipAddress: req.ip || null,
        severity: "LOW",
      });

      return res.status(400).json({
        success: false,
        message: "You have already checked in for this event.",
      });
    }

    // 4. Mark Attended, Award 50 XP, and Update Level
    const updated = await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.update({
        where: { id: registration.id },
        data: {
          attended: true,
          attendanceMarkedAt: new Date(),
          checkinMethod: "QR_SCAN",
          deviceInfo: req.headers["user-agent"] || null,
        },
      });

      // Award +50 XP
      const updatedUser = await tx.user.update({
        where: { id: studentId },
        data: {
          xp: { increment: 50 },
          lastActivityDate: new Date(),
        },
        select: { id: true, xp: true, level: true },
      });

      const calculatedLevel = Math.floor(updatedUser.xp / 100) + 1;
      if (calculatedLevel !== updatedUser.level) {
        await tx.user.update({
          where: { id: studentId },
          data: { level: calculatedLevel },
        });
      }

      await tx.notification.create({
        data: {
          userId: studentId,
          title: `Attendance Confirmed: ${event.title}`,
          message: `Your check-in for "${event.title}" has been verified! +50 XP awarded.`,
          type: "INFO",
          link: "/passport",
        },
      });

      return reg;
    });

    // 5. Add Skill Evidence & Evaluate Achievements
    try {
      const categorySkill = event.category || "Technical Workshop";
      await addSkillEvidence(studentId, categorySkill, {
        sourceType: "EVENT_ATTENDANCE",
        sourceTitle: event.title,
        sourceId: event.id,
        weightPoints: 15,
      });

      if (event.category?.toLowerCase().includes("hackathon")) {
        await addSkillEvidence(studentId, "Hackathon & Problem Solving", {
          sourceType: "HACKATHON",
          sourceTitle: event.title,
          sourceId: event.id,
          weightPoints: 20,
        });
      }

      await evaluateAndUnlockAchievements(studentId);
    } catch (e) {
      console.error("Skill evidence error:", e);
    }

    return res.status(200).json({
      success: true,
      message: "Attendance verified successfully! +50 XP earned.",
      registration: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// TOGGLE SINGLE ATTENDANCE (Admin / Faculty / Coordinator)
// ======================================================
const markAttendance = async (req, res, next) => {
  try {
    const { registrationId, attended } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required.",
      });
    }

    const reg = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        attended: attended ?? true,
        attendanceMarkedAt: attended ? new Date() : null,
        checkinMethod: attended ? "MANUAL" : null,
      },
      include: {
        user: true,
        event: true,
      },
    });

    if (attended) {
      await prisma.notification.create({
        data: {
          userId: reg.userId,
          title: `Attendance Verified: ${reg.event.title}`,
          message: `Your attendance for "${reg.event.title}" was recorded by the organizer.`,
          type: "INFO",
          link: "/passport",
        },
      });

      try {
        await addSkillEvidence(reg.userId, reg.event.category || "Technical Skill", {
          sourceType: "EVENT_ATTENDANCE",
          sourceTitle: reg.event.title,
          sourceId: reg.event.id,
          weightPoints: 15,
        });
        await evaluateAndUnlockAchievements(reg.userId);
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: `Attendance marked as ${attended ? "PRESENT" : "ABSENT"}.`,
      registration: reg,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// BULK MARK ALL ATTENDED (Admin / Coordinator)
// ======================================================
const markAllAttended = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required.",
      });
    }

    const unMarked = await prisma.registration.findMany({
      where: { eventId, attended: false },
      include: { event: true },
    });

    const result = await prisma.registration.updateMany({
      where: { eventId, attended: false },
      data: {
        attended: true,
        attendanceMarkedAt: new Date(),
        checkinMethod: "BULK",
      },
    });

    // Update skills & achievements for unMarked students
    for (const reg of unMarked) {
      try {
        await addSkillEvidence(reg.userId, reg.event.category || "Technical Skill", {
          sourceType: "EVENT_ATTENDANCE",
          sourceTitle: reg.event.title,
          sourceId: reg.event.id,
          weightPoints: 15,
        });
        await evaluateAndUnlockAchievements(reg.userId);
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: `Successfully marked ${result.count} students as Present.`,
      updatedCount: result.count,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// EXPORT ATTENDANCE ROSTER AS CSV
// ======================================================
const exportCSV = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: {
            user: true,
            certificate: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    let csv = "Student Name,Email,Department,Year,Status,Checkin Method,Checked In At,Certificate Code\n";

    for (const reg of event.registrations) {
      const name = `"${reg.user.fullName.replace(/"/g, '""')}"`;
      const email = `"${reg.user.email}"`;
      const dept = `"${reg.user.department || "N/A"}"`;
      const year = reg.user.year || "N/A";
      const status = reg.attended ? "PRESENT" : "ABSENT";
      const method = reg.checkinMethod || "N/A";
      const time = reg.attendanceMarkedAt ? new Date(reg.attendanceMarkedAt).toISOString() : "N/A";
      const cert = reg.certificate ? reg.certificate.certificateCode : "N/A";

      csv += `${name},${email},${dept},${year},${status},${method},${time},${cert}\n`;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Attendance_${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv"`
    );

    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRotatingQR,
  checkInQR,
  markAttendance,
  markAllAttended,
  exportCSV,
};