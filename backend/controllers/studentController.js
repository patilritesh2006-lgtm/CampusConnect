const prisma = require("../config/prisma");

// ======================================================
// GET ALL STUDENTS
// ADMIN ONLY
// ======================================================

const getAllStudents = async (req, res) => {
  try {
    console.log("========== GET ALL STUDENTS ==========");

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        year: true,
        createdAt: true,

        registrations: {
          select: {
            id: true,
            createdAt: true,

            event: {
              select: {
                id: true,
                title: true,
                venue: true,
                eventDate: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedStudents = students.map((student) => ({
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      department: student.department,
      year: student.year,
      createdAt: student.createdAt,

      registrationCount: student.registrations.length,

      registrations: student.registrations.map(
        (registration) => ({
          id: registration.id,
          createdAt: registration.createdAt,
          event: registration.event,
        })
      ),
    }));

    return res.status(200).json({
      success: true,
      count: formattedStudents.length,
      students: formattedStudents,
    });
  } catch (error) {
    console.error("========== GET STUDENTS ERROR ==========");
    console.error(error);
    console.error("========================================");

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students.",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE STUDENT
// ADMIN ONLY
// ======================================================

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("========== GET STUDENT ==========");
    console.log("Student ID:", id);

    const student = await prisma.user.findFirst({
      where: {
        id,
        role: "STUDENT",
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        year: true,
        createdAt: true,

        registrations: {
          select: {
            id: true,
            createdAt: true,

            event: {
              select: {
                id: true,
                title: true,
                description: true,
                venue: true,
                eventDate: true,
                status: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      success: true,
      student: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        department: student.department,
        year: student.year,
        createdAt: student.createdAt,

        registrationCount:
          student.registrations.length,

        registrations: student.registrations,
      },
    });
  } catch (error) {
    console.error("========== GET STUDENT ERROR ==========");
    console.error(error);
    console.error("=======================================");

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
};