const prisma = require("../config/prisma");

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    console.error("GET ANNOUNCEMENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements.",
      error: error.message,
    });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, priority } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required.",
      });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || "GENERAL",
        priority: priority || "NORMAL",
      },
    });

    // Broadcast in-app notification to all students
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true },
    });

    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map((s) => ({
          userId: s.id,
          title: "📢 Announcement: " + title.trim(),
          message: content.trim().slice(0, 120) + (content.trim().length > 120 ? "..." : ""),
          type: "ANNOUNCEMENT",
          link: "/announcements",
        })),
      });
    }

    return res.status(201).json({
      success: true,
      message: "Announcement published successfully.",
      announcement,
    });
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create announcement.",
      error: error.message,
    });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.announcement.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ANNOUNCEMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete announcement.",
      error: error.message,
    });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
