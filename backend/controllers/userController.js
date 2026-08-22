const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

// Get profile + computed achievements
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        year: true,
        role: true,
        createdAt: true,
        registrations: {
          include: {
            event: true,
            certificate: true,
          },
        },
        certificates: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const totalRegistered = user.registrations.length;
    const totalAttended = user.registrations.filter((r) => r.attended).length;
    const totalCertificates = user.certificates.length;
    const attendanceRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

    // Badges calculation
    const badges = [
      {
        id: "active_participant",
        title: "Active Participant",
        description: "Registered for at least 1 campus event",
        icon: "🎯",
        unlocked: totalRegistered >= 1,
      },
      {
        id: "event_explorer",
        title: "Event Explorer",
        description: "Registered for 3 or more campus events",
        icon: "🚀",
        unlocked: totalRegistered >= 3,
      },
      {
        id: "event_champion",
        title: "Event Champion",
        description: "Attended 3 or more campus events",
        icon: "🥇",
        unlocked: totalAttended >= 3,
      },
      {
        id: "certified_scholar",
        title: "Certified Scholar",
        description: "Earned 1 or more verified certificates",
        icon: "📜",
        unlocked: totalCertificates >= 1,
      },
      {
        id: "punctual_attendee",
        title: "Punctual Attendee",
        description: "Maintained a 100% attendance rate",
        icon: "⭐",
        unlocked: totalRegistered >= 2 && attendanceRate === 100,
      },
    ];

    return res.status(200).json({
      success: true,
      profile: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        year: user.year,
        role: user.role,
        joinedAt: user.createdAt,
      },
      achievements: {
        totalRegistered,
        totalAttended,
        totalCertificates,
        attendanceRate,
        badges,
      },
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile.",
      error: error.message,
    });
  }
};

// Update profile details
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, department, year } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName: fullName.trim() }),
        ...(department !== undefined && { department: department.trim() }),
        ...(year !== undefined && { year: year ? parseInt(year, 10) : null }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        year: true,
        role: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updated,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
