const prisma = require("../config/prisma");

// ======================================================
// UPLOAD / ADD MEDIA ITEM TO EVENT
// ======================================================
const addEventMedia = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { mediaUrl, mediaType, caption } = req.body;

    if (!mediaUrl) {
      return res.status(400).json({
        success: false,
        message: "Media URL is required.",
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

    const media = await prisma.eventMedia.create({
      data: {
        eventId,
        mediaUrl,
        mediaType: mediaType || "IMAGE",
        caption: caption?.trim() || null,
        uploadedBy: req.user.fullName,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Media added to event gallery successfully.",
      media,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET EVENT MEDIA GALLERY
// ======================================================
const getEventMedia = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const media = await prisma.eventMedia.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      media,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addEventMedia,
  getEventMedia,
};
