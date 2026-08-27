const prisma = require('../config/prisma');

// ======================================================
// SUBMIT EVENT FEEDBACK (Student)
// ======================================================
const submitFeedback = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user.id;
    const { rating, experience, organization, speakerQuality, wouldRecommend, comments } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'A rating between 1 and 5 stars is required.',
      });
    }

    // Verify registration and attendance
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: studentId,
          eventId,
        },
      },
    });

    if (!registration || !registration.attended) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback for events you have attended.',
      });
    }

    const existingFeedback = await prisma.eventFeedback.findUnique({
      where: {
        userId_eventId: {
          userId: studentId,
          eventId,
        },
      },
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this event.',
      });
    }

    const feedback = await prisma.$transaction(async (tx) => {
      const fb = await tx.eventFeedback.create({
        data: {
          eventId,
          userId: studentId,
          rating: parseInt(rating, 10),
          experience,
          organization: organization ? parseInt(organization, 10) : null,
          speakerQuality: speakerQuality ? parseInt(speakerQuality, 10) : null,
          wouldRecommend: wouldRecommend ?? true,
          comments: comments?.trim() || null,
        },
      });

      // Award +25 XP for contributing feedback
      await tx.user.update({
        where: { id: studentId },
        data: { xp: { increment: 25 } },
      });

      return fb;
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! +25 XP awarded.',
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET EVENT FEEDBACK & RATINGS (Admin / Public Summary)
// ======================================================
const getEventFeedback = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const feedbacks = await prisma.eventFeedback.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, fullName: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReviews = feedbacks.length;
    const avgRating =
      totalReviews > 0
        ? Number((feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalReviews).toFixed(1))
        : 0;

    const recommendPercent =
      totalReviews > 0
        ? Math.round((feedbacks.filter((f) => f.wouldRecommend).length / totalReviews) * 100)
        : 100;

    return res.status(200).json({
      success: true,
      summary: {
        totalReviews,
        avgRating,
        recommendPercent,
      },
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getEventFeedback,
};
