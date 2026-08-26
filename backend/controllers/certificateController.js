const prisma = require("../config/prisma");
const crypto = require("crypto");

/**
 * Generate a unique collision-free cryptographic Certificate Code
 * Format: CC-YYYY-EVENTCODE-RANDOMHEX
 */
const generateCertificateCode = (eventTitle) => {
  const year = new Date().getFullYear();
  const cleanTitle = eventTitle
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 4)
    .toUpperCase();
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `CC-${year}-${cleanTitle}-${randomHex}`;
};

// ======================================================
// ISSUE CERTIFICATE FOR ATTENDED STUDENT
// ======================================================
const issueCertificate = async (req, res, next) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required.",
      });
    }

    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        event: { include: { college: true } },
        certificate: true,
      },
    });

    if (!reg) {
      return res.status(404).json({
        success: false,
        message: "Registration record not found.",
      });
    }

    if (!reg.attended) {
      return res.status(400).json({
        success: false,
        message: "Cannot issue certificate. Student has not attended this event.",
      });
    }

    if (reg.certificate) {
      return res.status(400).json({
        success: false,
        message: "Certificate has already been issued for this registration.",
        certificate: reg.certificate,
      });
    }

    const certificateCode = generateCertificateCode(reg.event.title);

    const certificate = await prisma.$transaction(async (tx) => {
      const cert = await tx.certificate.create({
        data: {
          certificateCode,
          userId: reg.userId,
          eventId: reg.eventId,
          registrationId: reg.id,
          issueDate: new Date(),
        },
        include: {
          user: true,
          event: { include: { college: true } },
        },
      });

      // Award +100 XP for earning a certificate
      await tx.user.update({
        where: { id: reg.userId },
        data: { xp: { increment: 100 } },
      });

      // Trigger notification
      await tx.notification.create({
        data: {
          userId: reg.userId,
          title: `Certificate Issued: ${reg.event.title}`,
          message: `Congratulations! Your certificate of participation for "${reg.event.title}" is ready to view & download. (+100 XP awarded)`,
          type: "CERTIFICATE",
          link: "/student-certificates",
        },
      });

      return cert;
    });

    return res.status(201).json({
      success: true,
      message: "Certificate issued successfully.",
      certificate,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// BULK ISSUE CERTIFICATES FOR ALL ATTENDED STUDENTS
// ======================================================
const bulkIssueCertificates = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required.",
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // Find all attended students without certificates
    const eligibleRegistrations = await prisma.registration.findMany({
      where: {
        eventId,
        attended: true,
        certificate: null,
      },
      include: { user: true },
    });

    let issuedCount = 0;

    for (const reg of eligibleRegistrations) {
      const certificateCode = generateCertificateCode(event.title);

      await prisma.certificate.create({
        data: {
          certificateCode,
          userId: reg.userId,
          eventId: reg.eventId,
          registrationId: reg.id,
          issueDate: new Date(),
        },
      });

      // Award XP & Notification
      await prisma.user.update({
        where: { id: reg.userId },
        data: { xp: { increment: 100 } },
      });

      await prisma.notification.create({
        data: {
          userId: reg.userId,
          title: `Certificate Ready: ${event.title}`,
          message: `Your verified certificate for "${event.title}" is now available on your dashboard!`,
          type: "CERTIFICATE",
          link: "/student-certificates",
        },
      });

      issuedCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Successfully issued ${issuedCount} certificate(s).`,
      issuedCount,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET MY CERTIFICATES (Student)
// ======================================================
const getMyCertificates = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        event: {
          include: { college: true },
        },
        user: {
          select: { id: true, fullName: true, email: true, department: true },
        },
      },
      orderBy: { issueDate: "desc" },
    });

    return res.status(200).json({
      success: true,
      certificates,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// PUBLIC VERIFY CERTIFICATE (No login required)
// ======================================================
const verifyCertificate = async (req, res, next) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Certificate code is required.",
      });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: code.trim().toUpperCase() },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            department: true,
          },
        },
        event: {
          include: {
            college: true,
          },
        },
      },
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "No authentic record found for this certificate code.",
      });
    }

    // Build LinkedIn Add-To-Profile URL
    const clientBaseUrl = process.env.CLIENT_BASE_URL || "http://localhost:5173";
    const certUrl = `${clientBaseUrl}/verify-certificate/${certificate.certificateCode}`;
    const issueYear = new Date(certificate.issueDate).getFullYear();
    const issueMonth = new Date(certificate.issueDate).getMonth() + 1;
    const certName = encodeURIComponent(`${certificate.event.title} - Certificate of Participation`);
    const orgName = encodeURIComponent(certificate.event.college?.name || "CampusConnect");

    const linkedInShareUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(certUrl)}&certId=${certificate.certificateCode}`;

    return res.status(200).json({
      success: true,
      valid: true,
      certificate: {
        id: certificate.id,
        certificateCode: certificate.certificateCode,
        studentName: certificate.user.fullName,
        department: certificate.user.department,
        eventTitle: certificate.event.title,
        eventCategory: certificate.event.category,
        eventDate: certificate.event.eventDate,
        venue: certificate.event.venue,
        collegeName: certificate.event.college?.name || "CampusConnect Institution",
        issueDate: certificate.issueDate,
        linkedInShareUrl,
        verificationUrl: certUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL CERTIFICATES (Admin)
// ======================================================
const getAllCertificates = async (req, res, next) => {
  try {
    const certificates = await prisma.certificate.findMany({
      include: {
        user: { select: { id: true, fullName: true, email: true, department: true } },
        event: { select: { id: true, title: true, eventDate: true, category: true } },
      },
      orderBy: { issueDate: "desc" },
    });

    return res.status(200).json({
      success: true,
      certificates,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  issueCertificate,
  bulkIssueCertificates,
  getMyCertificates,
  verifyCertificate,
  getAllCertificates,
};
