const prisma = require('../config/prisma');

// ======================================================
// REGISTER FOR EVENT
// POST /api/registrations
// STUDENT ONLY
// ======================================================

const registerForEvent = async (req, res) => {
  try {
    console.log('========== REGISTER EVENT ==========');

    const targetUserId = req.user?.id || req.body.user_id || req.body.userId;
    const targetEventId = req.body.eventId || req.body.event_id;

    // Check required fields
    if (!targetUserId || !targetEventId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Event ID are required.',
      });
    }

    // ==================================================
    // CHECK USER
    // ==================================================

    const user = await prisma.user.findUnique({
      where: {
        id: targetUserId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // ==================================================
    // CHECK EVENT
    // ==================================================

    const event = await prisma.event.findUnique({
      where: {
        id: targetEventId,
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // ==================================================
    // CHECK EVENT CAPACITY LIMITS
    // ==================================================
    if (event.capacity && event.capacity > 0) {
      const currentCount = await prisma.registration.count({
        where: { eventId: targetEventId },
      });
      if (currentCount >= event.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Event is at full capacity.',
        });
      }
    }

    // ==================================================
    // CHECK DUPLICATE REGISTRATION
    // ==================================================

    const existing = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: targetUserId,
          eventId: targetEventId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event.',
      });
    }

    // ==================================================
    // CREATE REGISTRATION
    // ==================================================

    const registration = await prisma.registration.create({
      data: {
        userId: targetUserId,
        eventId: targetEventId,
      },
      include: {
        event: true,
      },
    });

    console.log('Registration created:', registration);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      registration,
    });
  } catch (error) {
    console.error('========== REGISTER EVENT ERROR ==========');
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to register for event.',
      error: error.message,
    });
  }
};

// ======================================================
// GET MY REGISTRATIONS
// GET /api/registrations/:user_id
// STUDENT ONLY
// ======================================================

const getMyRegistrations = async (req, res) => {
  try {
    console.log('========== GET MY REGISTRATIONS ==========');

    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
    }

    // Ensure student only accesses their own registrations
    if (
      req.user &&
      req.user.role !== 'ADMIN' &&
      req.user.id !== user_id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own registrations.',
      });
    }

    // ==================================================
    // GET REGISTRATIONS
    // ==================================================

    const registrations = await prisma.registration.findMany({
      where: {
        userId: user_id,
      },
      include: {
        event: {
          include: {
            college: true,
          },
        },
        certificate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error('========== GET MY REGISTRATIONS ERROR ==========');
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations.',
      error: error.message,
    });
  }
};

// ======================================================
// CANCEL REGISTRATION
// DELETE /api/registrations/:registrationId
// ======================================================

const cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found.',
      });
    }

    if (!isAdmin && registration.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own registration.',
      });
    }

    await prisma.registration.delete({
      where: { id: registrationId },
    });

    // Send confirmation notification
    await prisma.notification.create({
      data: {
        userId: registration.userId,
        title: 'Registration Cancelled',
        message: `Your registration for "${registration.event.title}" has been cancelled.`,
        type: 'ALERT',
        link: '/student-events',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully.',
    });
  } catch (error) {
    console.error('CANCEL REGISTRATION ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel registration.',
      error: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
};
