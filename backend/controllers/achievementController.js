const prisma = require("../config/prisma");
const { evaluateAndUnlockAchievements } = require("../services/achievementService");

const getAchievements = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Trigger check
    await evaluateAndUnlockAchievements(userId);

    const allAchievements = await prisma.achievement.findMany({
      orderBy: { xpReward: "asc" },
    });

    const userUnlocked = await prisma.studentAchievement.findMany({
      where: { userId },
    });
    const unlockedMap = {};
    userUnlocked.forEach((u) => {
      unlockedMap[u.achievementId] = u.unlockedAt;
    });

    const result = allAchievements.map((ach) => ({
      ...ach,
      isUnlocked: Boolean(unlockedMap[ach.id]),
      unlockedAt: unlockedMap[ach.id] || null,
    }));

    return res.json({
      success: true,
      achievements: result,
      unlockedCount: userUnlocked.length,
      totalCount: allAchievements.length,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAchievements,
};