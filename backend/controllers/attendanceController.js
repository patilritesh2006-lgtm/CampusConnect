const prisma = require("../config/prisma");

const toggleAttendance = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const { attended } = req.body;

    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      include: {
        event: true,
        user: true,
      },
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration record not found.",
      });
    }

    const newAttended = attended !== undefined ? Boolean(attended) : !registration.attended;

    const updated = await prisma.registration.update({
      where: {
        id: registration.id,
      },
      data: {
        attended: newAttended,
        attendanceMarkedAt: newAttended ? new Date() : null,
      },
    });

    if (newAttended) {
      await prisma.notification.create({
        data: {
          userId,
          title: "Attendance Confirmed",
          message: "Your attendance for " + registration.event.title + " has been confirmed.",
          type: "INFO",
          link: "/my-registrations",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: newAttended ? "Attendance marked as Present." : "Attendance marked as Absent.",
      registration: updated,
    });
  } catch (error) {
    console.error("TOGGLE ATTENDANCE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update attendance.",
      error: error.message,
    });
  }
};

const bulkMarkAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userIds, attended } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds array is required.",
      });
    }

    const newAttended = attended !== undefined ? Boolean(attended) : true;

    await prisma.registration.updateMany({
      where: {
        eventId,
        userId: { in: userIds },
      },
      data: {
        attended: newAttended,
        attendanceMarkedAt: newAttended ? new Date() : null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Successfully updated attendance for " + userIds.length + " students.",
    });
  } catch (error) {
    console.error("BULK ATTENDANCE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to bulk update attendance.",
      error: error.message,
    });
  }
};

module.exports = {
  toggleAttendance,
  bulkMarkAttendance,
};
