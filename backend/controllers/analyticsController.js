const prisma = require('../config/prisma');

/**
 * Compute the Official CampusConnect Student Engagement Score (0 - 100)
 * Weighted Formula:
 * - Attendance Rate (40%)
 * - Completed Events Attended (30%)
 * - Verified Certificates Earned (20%)
 * - Gamification XP Level (10%)
 */
const calculateEngagementScore = (stats) => {
  const { totalRegistered, totalAttended, totalCertificates, xp } = stats;

  if (totalRegistered === 0) return 0;

  const attendanceRate = (totalAttended / totalRegistered) * 40;
  const attendanceVolume = Math.min(totalAttended * 6, 30);
  const certificateVolume = Math.min(totalCertificates * 10, 20);
  const xpComponent = Math.min(Math.floor(xp / 50), 10);

  const rawScore = attendanceRate + attendanceVolume + certificateVolume + xpComponent;
  return Math.min(100, Math.round(rawScore));
};

// ======================================================
// GET COMPREHENSIVE ADMIN ANALYTICS
// ======================================================
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalEvents,
      totalStudents,
      totalRegistrations,
      attendedRegistrations,
      totalCertificates,
      events,
      students,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.registration.count(),
      prisma.registration.count({ where: { attended: true } }),
      prisma.certificate.count(),
      prisma.event.findMany({
        include: {
          registrations: true,
          certificates: true,
        },
        orderBy: { eventDate: 'desc' },
      }),
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        include: {
          registrations: true,
          certificates: true,
        },
      }),
    ]);

    const attendanceRate =
      totalRegistrations > 0
        ? Math.round((attendedRegistrations / totalRegistrations) * 100)
        : 0;

    // 1. Department Breakdown
    const deptMap = {};
    students.forEach((s) => {
      const dept = s.department || 'General / Unassigned';
      if (!deptMap[dept]) {
        deptMap[dept] = { students: 0, registrations: 0, attended: 0 };
      }
      deptMap[dept].students++;
      deptMap[dept].registrations += s.registrations.length;
      deptMap[dept].attended += s.registrations.filter((r) => r.attended).length;
    });

    const departmentStats = Object.keys(deptMap).map((dept) => ({
      department: dept,
      ...deptMap[dept],
      attendanceRate:
        deptMap[dept].registrations > 0
          ? Math.round((deptMap[dept].attended / deptMap[dept].registrations) * 100)
          : 0,
    }));

    // 2. Top Events Leaderboard
    const topEvents = events
      .map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        eventDate: e.eventDate,
        registrationsCount: e.registrations.length,
        attendedCount: e.registrations.filter((r) => r.attended).length,
        certificatesCount: e.certificates.length,
        fillRate:
          e.capacity && e.capacity > 0
            ? Math.round((e.registrations.length / e.capacity) * 100)
            : 100,
      }))
      .sort((a, b) => b.registrationsCount - a.registrationsCount)
      .slice(0, 5);

    // 3. Overall Student Engagement Score Average
    const studentScores = students.map((s) => {
      const totalReg = s.registrations.length;
      const totalAtt = s.registrations.filter((r) => r.attended).length;
      const totalCert = s.certificates.length;
      return calculateEngagementScore({
        totalRegistered: totalReg,
        totalAttended: totalAtt,
        totalCertificates: totalCert,
        xp: s.xp || 0,
      });
    });

    const avgEngagementScore =
      studentScores.length > 0
        ? Math.round(
          studentScores.reduce((acc, val) => acc + val, 0) /
              studentScores.length
        )
        : 0;

    // 4. Category Popularity
    const categoryMap = {};
    events.forEach((e) => {
      const cat = e.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + e.registrations.length;
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalEvents,
        totalStudents,
        totalRegistrations,
        attendedRegistrations,
        totalCertificates,
        overallAttendanceRate: attendanceRate,
        avgEngagementScore,
      },
      departmentStats,
      topEvents,
      categoryStats: categoryMap,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminAnalytics,
  calculateEngagementScore,
};
