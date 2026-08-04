const prisma = require("../config/prisma");

// ====================== REGISTER FOR EVENT ======================
const registerForEvent = async (req, res) => {
  try {
    const { user_id, event_id } = req.body;

    if (!user_id || !event_id) {
      return res.status(400).json({
        success: false,
        message: "User ID and Event ID are required",
      });
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if event exists
    const event = await prisma.events.findUnique({
      where: { id: event_id },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Prevent duplicate registration
    const existing = await prisma.registrations.findFirst({
      where: {
        user_id,
        event_id,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this event",
      });
    }

    // Register
    const registration = await prisma.registrations.create({
      data: {
        user_id,
        event_id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      registration,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== GET MY REGISTRATIONS ======================
const getMyRegistrations = async (req, res) => {
  try {
    const { user_id } = req.params;

    const registrations = await prisma.registrations.findMany({
      where: {
        user_id,
      },
      include: {
        events: true,
      },
    });

    res.status(200).json({
      success: true,
      registrations,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
};