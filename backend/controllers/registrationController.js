const prisma = require("../config/prisma");

// ======================================================
// REGISTER FOR EVENT
// POST /api/registrations
// ======================================================

const registerForEvent = async (req, res) => {
  try {
    const { user_id, event_id } = req.body;

    // Check required fields
    if (!user_id || !event_id) {
      return res.status(400).json({
        success: false,
        message: "User ID and Event ID are required",
      });
    }

    // ==================================================
    // CHECK USER
    // ==================================================

    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==================================================
    // CHECK EVENT
    // ==================================================

    const event = await prisma.event.findUnique({
      where: {
        id: event_id,
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // ==================================================
    // CHECK DUPLICATE REGISTRATION
    // ==================================================

    const existing = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: user_id,
          eventId: event_id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this event",
      });
    }

    // ==================================================
    // CREATE REGISTRATION
    // ==================================================

    const registration = await prisma.registration.create({
      data: {
        userId: user_id,
        eventId: event_id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      registration,
    });
  } catch (error) {
    console.error("REGISTER EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET MY REGISTRATIONS
// GET /api/registrations/:user_id
// ======================================================

const getMyRegistrations = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
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
        event: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("GET MY REGISTRATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  registerForEvent,
  getMyRegistrations,
};