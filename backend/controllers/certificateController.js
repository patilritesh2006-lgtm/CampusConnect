const prisma = require("../config/prisma");
const crypto = require("crypto");

// Generate unique certificate code: CC-2026-<EVENT_INITIALS>-<HEX>
const generateUniqueCode = (eventTitle) => {
  const initials = (eventTitle || "EV")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  const year = new Date().getFullYear();
  return "CC-" + year + "-" + initials + "-" + randomHex;
};

// Generate certificate for a student
const generateCertificate = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({
        success: false,
        message: "eventId and userId are required.",
      });
    }

    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      include: {
        event: true,
        user: true,
        certificate: true,
      },
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    if (registration.certificate) {
      return res.status(200).json({
        success: true,
        message: "Certificate already issued.",
        certificate: registration.certificate,
      });
    }

    const code = generateUniqueCode(registration.event.title);

    const certificate = await prisma.certificate.create({
      data: {
        certificateCode: code,
        userId,
        eventId,
        registrationId: registration.id,
      },
      include: {
        event: true,
        user: true,
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId,
        title: "Certificate Issued! 🏆",
        message: "Your certificate for " + registration.event.title + " is now available to download.",
        type: "CERTIFICATE",
        link: "/student-certificates",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Certificate generated successfully.",
      certificate,
    });
  } catch (error) {
    console.error("GENERATE CERTIFICATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate certificate.",
      error: error.message,
    });
  }
};

// Student view their own certificates
const getMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await prisma.certificate.findMany({
      where: {
        userId,
      },
      include: {
        event: {
          include: {
            college: true,
          },
        },
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
        issueDate: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("GET MY CERTIFICATES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates.",
      error: error.message,
    });
  }
};

// Admin view all issued certificates
const getAllCertificates = async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      include: {
        event: true,
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
        issueDate: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("GET ALL CERTIFICATES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates.",
      error: error.message,
    });
  }
};

// Public certificate verification
const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: {
        certificateCode: code.toUpperCase().trim(),
      },
      include: {
        event: {
          include: {
            college: true,
          },
        },
        user: {
          select: {
            fullName: true,
            email: true,
            department: true,
            year: true,
          },
        },
      },
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Certificate not found or invalid verification code.",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      certificate: {
        certificateCode: certificate.certificateCode,
        issueDate: certificate.issueDate,
        studentName: certificate.user.fullName,
        studentDepartment: certificate.user.department,
        studentYear: certificate.user.year,
        eventTitle: certificate.event.title,
        eventVenue: certificate.event.venue,
        eventDate: certificate.event.eventDate,
        collegeName: certificate.event.college?.name || "CampusConnect College",
      },
    });
  } catch (error) {
    console.error("VERIFY CERTIFICATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Verification service error.",
      error: error.message,
    });
  }
};

module.exports = {
  generateCertificate,
  getMyCertificates,
  getAllCertificates,
  verifyCertificate,
};
