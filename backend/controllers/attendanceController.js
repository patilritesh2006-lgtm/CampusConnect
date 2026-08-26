const prisma = require("../config/prisma");
const { generateEventQRToken, verifyEventQRToken } = require("../utils/qrService");

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
// STUDENT QR CHECK-IN
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

    if (event.status === "COMPLETED" || event.status === "CANCELLED") {
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
      return res.status(404).json({
        success: false,
        message: "You are not registered for this event.",
      });
    }

    if (registration.attended) {
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
        },
        select: { id: true, xp: true, level: true },
      });

      // Calculate level based on XP (every 100 XP = 1 Level)
      const calculatedLevel = Math.floor(updatedUser.xp / 100) + 1;
      if (calculatedLevel !== updatedUser.level) {
        await tx.user.update({
          where: { id: studentId },
          data: { level: calculatedLevel },
        });
      }

      // Create in-app notification
      await tx.notification.create({
        data: {
          userId: studentId,
          title: `Attendance Confirmed: ${event.title}`,
          message: `Your check-in for "${event.title}" has been verified! +50 XP awarded.`,
          type: "INFO",
          link: "/student-certificates",
        },
      });

      return reg;
    });

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
          link: "/student-certificates",
        },
      });
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

    const result = await prisma.registration.updateMany({
      where: { eventId, attended: false },
      data: {
        attended: true,
        attendanceMarkedAt: new Date(),
        checkinMethod: "BULK",
      },
    });

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

    // Generate CSV String
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
