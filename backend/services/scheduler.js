const cron = require('node-cron');
const prisma = require('../config/prisma');

/**
 * Initializes the automated reminder and maintenance scheduler
 */
const initScheduler = () => {
  console.log('⏰ [SCHEDULER] CampusConnect Event Reminder Service initialized.');

  // Runs every 15 minutes to check for upcoming events
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const next24hPlus15m = new Date(next24h.getTime() + 15 * 60 * 1000);

      const next1h = new Date(now.getTime() + 60 * 60 * 1000);
      const next1hPlus15m = new Date(next1h.getTime() + 15 * 60 * 1000);

      // Find events starting in ~24 hours
      const events24h = await prisma.event.findMany({
        where: {
          eventDate: {
            gte: next24h,
            lt: next24hPlus15m,
          },
          status: 'UPCOMING',
        },
        include: {
          registrations: {
            include: { user: true },
          },
        },
      });

      for (const event of events24h) {
        for (const reg of event.registrations) {
          // Check if notification already exists
          const existing = await prisma.notification.findFirst({
            where: {
              userId: reg.userId,
              title: `Reminder: ${event.title} is tomorrow!`,
            },
          });

          if (!existing) {
            await prisma.notification.create({
              data: {
                userId: reg.userId,
                title: `Reminder: ${event.title} is tomorrow!`,
                message: `Your registered event "${event.title}" is happening tomorrow at ${event.venue}. Be on time!`,
                type: 'REMINDER',
                link: '/student-events',
              },
            });
          }
        }
      }

      // Find events starting in ~1 hour
      const events1h = await prisma.event.findMany({
        where: {
          eventDate: {
            gte: next1h,
            lt: next1hPlus15m,
          },
          status: 'UPCOMING',
        },
        include: {
          registrations: {
            include: { user: true },
          },
        },
      });

      for (const event of events1h) {
        for (const reg of event.registrations) {
          const existing = await prisma.notification.findFirst({
            where: {
              userId: reg.userId,
              title: `Starting Soon: ${event.title}`,
            },
          });

          if (!existing) {
            await prisma.notification.create({
              data: {
                userId: reg.userId,
                title: `Starting Soon: ${event.title}`,
                message: `"${event.title}" starts in 1 hour at ${event.venue}. Have your QR pass ready!`,
                type: 'ALERT',
                link: '/student-events',
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Scheduler run error:', error);
    }
  });
};

module.exports = { initScheduler };
