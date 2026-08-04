const prisma = require("../config/prisma");

// ====================== CREATE EVENT ======================
const createEvent = async (req, res) => {
  try {
    const { title, description, venue, event_date, college_id } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({
        success: false,
        message: "Title and Event Date are required",
      });
    }

    const event = await prisma.events.create({
      data: {
        title,
        description,
        venue,
        event_date: new Date(event_date),
        college_id: college_id || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== GET ALL EVENTS ======================
const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.events.findMany({
      include: {
        registrations: true,
      },
      orderBy: {
        event_date: "asc",
      },
    });

    const formattedEvents = events.map((event) => ({
      ...event,
      registrationCount: event.registrations.length,
    }));

    return res.status(200).json({
      success: true,
      count: formattedEvents.length,
      events: formattedEvents,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== GET EVENT BY ID ======================
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.events.findUnique({
      where: {
        id,
      },
      include: {
        registrations: true,
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== UPDATE EVENT ======================
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const existingEvent = await prisma.events.findUnique({
      where: {
        id,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const updatedEvent = await prisma.events.update({
      where: {
        id,
      },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== DELETE EVENT ======================
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.registrations.deleteMany({
      where: {
        event_id: id,
      },
    });

    await prisma.events.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== REGISTER FOR EVENT ======================
const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const event = await prisma.events.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyRegistered = await prisma.registrations.findFirst({
      where: {
        user_id,
        event_id: id,
      },
    });

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this event",
      });
    }

    const registration = await prisma.registrations.create({
      data: {
        user_id,
        event_id: id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      registration,
    });
  } catch (error) {
    console.error("Register Event Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== GET REGISTERED STUDENTS ======================
const getRegisteredStudents = async (req, res) => {
  try {
    const { id } = req.params;

    const registrations = await prisma.registrations.findMany({
      where: {
        event_id: id,
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            department: true,
            year: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      students: registrations.map((r) => r.users),
    });
  } catch (error) {
    console.error("Get Students Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== DASHBOARD STATS ======================
const getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await prisma.events.count();
    const totalRegistrations = await prisma.registrations.count();

    return res.status(200).json({
      success: true,
      totalEvents,
      totalRegistrations,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== EXPORTS ======================
module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getRegisteredStudents,
  getDashboardStats,
};