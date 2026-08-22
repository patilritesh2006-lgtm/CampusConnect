const prisma = require("../config/prisma");

const getAdminAnalytics = async (req, res) => {
  try {
    const [
      totalEvents,
      totalStudents,
      totalRegistrations,
      totalCertificates,
      events,
      students,
      registrations,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.registration.count(),
      prisma.certificate.count(),
      prisma.event.findMany({
        include: {
          registrations: true,
          certificates: true,
        },
      }),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        select: { department: true, year: true },
      }),
      prisma.registration.findMany({
        select: { attended: true, createdAt: true },
      }),
    ]);

    const totalAttended = registrations.filter((r) => r.attended).length;
    const overallAttendanceRate = totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0;

    // Department Breakdown
    const departmentCounts = {};
    students.forEach((s) => {
      const dept = s.department || "Unassigned";
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    const departmentStats = Object.keys(departmentCounts).map((dept) => ({
      department: dept,
      studentCount: departmentCounts[dept],
      percentage: totalStudents > 0 ? Math.round((departmentCounts[dept] / totalStudents) * 100) : 0,
    }));

    // Top Popular Events
    const popularEvents = events
      .map((e) => ({
        id: e.id,
        title: e.title,
        venue: e.venue,
        eventDate: e.eventDate,
        status: e.status,
        registrationCount: e.registrations.length,
        attendedCount: e.registrations.filter((r) => r.attended).length,
        certificateCount: e.certificates.length,
      }))
      .sort((a, b) => b.registrationCount - a.registrationCount)
      .slice(0, 5);

    // Event Status Distribution
    const statusCounts = {
      UPCOMING: events.filter((e) => e.status === "UPCOMING").length,
      ONGOING: events.filter((e) => e.status === "ONGOING").length,
      COMPLETED: events.filter((e) => e.status === "COMPLETED").length,
      CANCELLED: events.filter((e) => e.status === "CANCELLED").length,
    };

    return res.status(200).json({
      success: true,
      analytics: {
        summary: {
          totalEvents,
          totalStudents,
          totalRegistrations,
          totalAttended,
          totalCertificates,
          overallAttendanceRate,
        },
        departmentStats,
        popularEvents,
        statusCounts,
      },
    });
  } catch (error) {
    console.error("GET ADMIN ANALYTICS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate analytics.",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminAnalytics,
};
