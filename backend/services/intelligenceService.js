const prisma = require("../config/prisma");

/**
 * Generates institutional intelligence KPIs and data-grounded AI insights.
 */
const getInstitutionalIntelligence = async (collegeId) => {
  const whereCollege = collegeId ? { collegeId } : {};
  const whereEventCollege = collegeId ? { event: { collegeId } } : {};

  // 1. Gather raw metrics
  const totalStudents = await prisma.user.count({
    where: { role: "STUDENT", ...whereCollege },
  });

  const totalEvents = await prisma.event.count({
    where: { ...whereCollege },
  });

  const totalRegistrations = await prisma.registration.count({
    where: { ...whereEventCollege },
  });

  const totalAttended = await prisma.registration.count({
    where: { attended: true, ...whereEventCollege },
  });

  const totalCredentials = await prisma.credential.count({
    where: { status: "VALID", ...whereCollege },
  });

  const overallAttendanceRate =
    totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0;

  // 2. Department Breakdown
  const studentsByDept = await prisma.user.groupBy({
    by: ["department"],
    where: { role: "STUDENT", ...whereCollege },
    _count: { id: true },
  });

  const registrationsByDept = await prisma.registration.findMany({
    where: { ...whereEventCollege },
    include: {
      user: { select: { department: true } },
    },
  });

  const deptMetrics = {};
  studentsByDept.forEach((dept) => {
    const name = dept.department || "General";
    deptMetrics[name] = {
      department: name,
      studentsCount: dept._count.id,
      registrationsCount: 0,
      attendedCount: 0,
      attendanceRate: 0,
    };
  });

  registrationsByDept.forEach((reg) => {
    const deptName = reg.user?.department || "General";
    if (!deptMetrics[deptName]) {
      deptMetrics[deptName] = {
        department: deptName,
        studentsCount: 1,
        registrationsCount: 0,
        attendedCount: 0,
        attendanceRate: 0,
      };
    }
    deptMetrics[deptName].registrationsCount += 1;
    if (reg.attended) {
      deptMetrics[deptName].attendedCount += 1;
    }
  });

  const departmentList = Object.values(deptMetrics).map((d) => ({
    ...d,
    attendanceRate:
      d.registrationsCount > 0 ? Math.round((d.attendedCount / d.registrationsCount) * 100) : 0,
  }));

  // Sort by highest attendance rate
  departmentList.sort((a, b) => b.attendanceRate - a.attendanceRate);

  // 3. AI Grounded Trend Insights
  const insights = [];

  if (departmentList.length > 0) {
    const topDept = departmentList[0];
    insights.push({
      type: "SUCCESS",
      title: "Top Performing Department",
      summary: `${topDept.department} leads campus engagement with a ${topDept.attendanceRate}% verified attendance rate across ${topDept.registrationsCount} registrations.`,
    });
  }

  if (overallAttendanceRate >= 75) {
    insights.push({
      type: "POSITIVE",
      title: "High Event Utilization",
      summary: `Overall campus event attendance is strong at ${overallAttendanceRate}%, exceeding standard institutional benchmarks (70%).`,
    });
  } else {
    insights.push({
      type: "ACTION_REQUIRED",
      title: "Attendance Gap Detected",
      summary: `Overall event attendance is currently at ${overallAttendanceRate}%. Consider sending automated push reminders 1 hour before kickoff to increase check-ins.`,
    });
  }

  const fraudCount = await prisma.attendanceRisk.count({
    where: { riskLevel: "HIGH", reviewStatus: "PENDING" },
  });

  if (fraudCount > 0) {
    insights.push({
      type: "SECURITY_ALERT",
      title: "Pending Attendance Anomaly Flags",
      summary: `${fraudCount} high-risk attendance events were detected by the fraud engine and require administrator review.`,
    });
  }

  return {
    kpis: {
      totalStudents,
      totalEvents,
      totalRegistrations,
      totalAttended,
      totalCredentials,
      overallAttendanceRate,
      averageEngagementScore: Math.min(100, Math.round(overallAttendanceRate * 0.7 + (totalCredentials > 0 ? 25 : 10))),
    },
    departments: departmentList,
    insights,
  };
};

module.exports = {
  getInstitutionalIntelligence,
};