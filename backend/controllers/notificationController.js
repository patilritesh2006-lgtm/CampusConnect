const prisma = require("../config/prisma");

// Get notifications for logged in user
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};

// Mark single notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
      error: error.message,
    });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
      error: error.message,
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
