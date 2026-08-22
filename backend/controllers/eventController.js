const prisma = require("../config/prisma");

// ======================================================
// CREATE EVENT
// ======================================================
const createEvent = async (req, res) => {
  try {
    console.log("========== CREATE EVENT ==========");
    console.log("Request body:", req.body);

    const {
      title,
      description,
      venue,
      event_date,
      eventDate,
      collegeId,
      status,
    } = req.body;

    if (!title || !venue || (!event_date && !eventDate)) {
      return res.status(400).json({
        success: false,
        message: "Title, venue and event date are required.",
      });
    }

    const dateValue = event_date || eventDate;
    const parsedDate = new Date(dateValue + "T00:00:00");

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date.",
      });
    }

    let selectedCollegeId = collegeId;

    if (!selectedCollegeId) {
      const existingCollege = await prisma.college.findFirst();

      if (existingCollege) {
        selectedCollegeId = existingCollege.id;
      } else {
        const newCollege = await prisma.college.create({
          data: {
            name: "CampusConnect College",
            email: "admin@campusconnect.com",
            address: "CampusConnect",
          },
        });

        selectedCollegeId = newCollege.id;
      }
    }

    const college = await prisma.college.findUnique({
      where: {
        id: selectedCollegeId,
      },
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found.",
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || "",
        venue,
        collegeId: selectedCollegeId,
        eventDate: parsedDate,
        status: status || "UPCOMING",
      },
      include: {
        college: true,
      },
    });

    console.log("Event created:", event);

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event,
    });
  } catch (error) {
    console.error("========== CREATE EVENT ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create event.",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL EVENTS
// ======================================================
const getAllEvents = async (req, res) => {
  try {
    console.log("========== GET ALL EVENTS ==========");

    const events = await prisma.event.findMany({
      orderBy: {
        eventDate: "asc",
      },
      include: {
        college: true,
        registrations: true,
      },
    });

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("========== GET EVENTS ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch events.",
      error: error.message,
    });
  }
};

// ======================================================
// GET EVENT BY ID
// ======================================================
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        college: true,
        registrations: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("GET EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch event.",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE EVENT
// ======================================================
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      venue,
      event_date,
      eventDate,
      status,
    } = req.body;

    const existingEvent = await prisma.event.findUnique({
      where: {
        id,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    let parsedDate = null;

    if (event_date || eventDate) {
      const dateValue = event_date || eventDate;

      parsedDate = new Date(dateValue + "T00:00:00");

      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid event date.",
        });
      }
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(venue !== undefined && { venue }),
        ...(parsedDate && { eventDate: parsedDate }),
        ...(status !== undefined && { status }),
      },
      include: {
        college: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update event.",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE EVENT
// ======================================================
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const existingEvent = await prisma.event.findUnique({
      where: {
        id,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    await prisma.registration.deleteMany({
      where: {
        eventId: id,
      },
    });

    await prisma.event.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete event.",
      error: error.message,
    });
  }
};

// ======================================================
// REGISTER FOR EVENT
// ======================================================
const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the logged-in user from JWT.
    // Do not trust userId from the frontend.
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    const event = await prisma.event.findUnique({
      where: {
        id,
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const existingRegistration =
      await prisma.registration.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId: id,
          },
        },
      });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "Already registered for this event.",
      });
    }

    const registration = await prisma.registration.create({
      data: {
        userId,
        eventId: id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully.",
      registration,
    });
  } catch (error) {
    console.error("REGISTER EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register for event.",
      error: error.message,
    });
  }
};

// ======================================================
// GET REGISTERED STUDENTS
// ======================================================
const getRegisteredStudents = async (req, res) => {
  try {
    const { id } = req.params;

    const registrations = await prisma.registration.findMany({
      where: {
        eventId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            department: true,
            year: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      students: registrations.map(
        (registration) => registration.user
      ),
    });
  } catch (error) {
    console.error(
      "GET REGISTERED STUDENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch registered students.",
      error: error.message,
    });
  }
};

// ======================================================
// DASHBOARD STATS
// ======================================================
const getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await prisma.event.count();

    const totalStudents = await prisma.user.count({
      where: {
        role: "STUDENT",
      },
    });

    const totalRegistrations =
      await prisma.registration.count();

    const upcomingEvents = await prisma.event.count({
      where: {
        status: "UPCOMING",
      },
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        totalStudents,
        totalRegistrations,
        upcomingEvents,
      },
    });
  } catch (error) {
    console.error(
      "GET DASHBOARD STATS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics.",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================
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
