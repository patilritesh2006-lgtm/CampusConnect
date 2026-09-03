const prisma = require("../config/prisma");

const DEFAULT_ACHIEVEMENTS = [
  {
    code: "FIRST_STEP",
    name: "First Step",
    description: "Attended your first verified campus event or workshop.",
    icon: "Footprints",
    rarity: "COMMON",
    xpReward: 50,
    criteriaType: "ATTENDANCE_COUNT",
    criteriaValue: 1,
  },
  {
    code: "TECH_EXPLORER",
    name: "Technical Explorer",
    description: "Attended 3 technical workshops across different technology domains.",
    icon: "Compass",
    rarity: "RARE",
    xpReward: 100,
    criteriaType: "ATTENDANCE_COUNT",
    criteriaValue: 3,
  },
  {
    code: "HACKATHON_HERO",
    name: "Hackathon Hero",
    description: "Participated and checked in to an official campus Hackathon.",
    icon: "Trophy",
    rarity: "EPIC",
    xpReward: 150,
    criteriaType: "HACKATHON_COUNT",
    criteriaValue: 1,
  },
  {
    code: "CREDENTIAL_HUNTER",
    name: "Credential Hunter",
    description: "Earned 2 or more cryptographically verified credentials.",
    icon: "Award",
    rarity: "EPIC",
    xpReward: 200,
    criteriaType: "CERTIFICATE_COUNT",
    criteriaValue: 2,
  },
  {
    code: "CAMPUS_LEGEND",
    name: "Campus Legend",
    description: "Demonstrated campus excellence by reaching Level 5 with 10+ verified events.",
    icon: "Crown",
    rarity: "LEGENDARY",
    xpReward: 500,
    criteriaType: "ATTENDANCE_COUNT",
    criteriaValue: 10,
  },
];

/**
 * Initializes default achievement catalog if empty.
 */
const initAchievementsCatalog = async () => {
  try {
    for (const ach of DEFAULT_ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { code: ach.code },
        update: {},
        create: ach,
      });
    }
  } catch (error) {
    console.error("Error initializing achievements catalog:", error);
  }
};

/**
 * Evaluates and unlocks eligible achievements for a student.
 */
const evaluateAndUnlockAchievements = async (userId) => {
  if (!userId) return [];

  // Ensure catalog exists
  await initAchievementsCatalog();

  // 1. Gather student metrics
  const attendedCount = await prisma.registration.count({
    where: { userId, attended: true },
  });

  const certCount =
    (await prisma.certificate.count({ where: { userId } })) +
    (await prisma.credential.count({ where: { userId, status: "VALID" } }));

  const hackathonCount = await prisma.registration.count({
    where: {
      userId,
      attended: true,
      event: {
        category: { in: ["Hackathon", "HACKATHON", "Coding Challenge"] },
      },
    },
  });

  // 2. Fetch all achievements & unlocked
  const allAchievements = await prisma.achievement.findMany();
  const unlocked = await prisma.studentAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

  const newlyUnlocked = [];

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue;

    let eligible = false;
    if (ach.criteriaType === "ATTENDANCE_COUNT" && attendedCount >= ach.criteriaValue) {
      eligible = true;
    } else if (ach.criteriaType === "CERTIFICATE_COUNT" && certCount >= ach.criteriaValue) {
      eligible = true;
    } else if (ach.criteriaType === "HACKATHON_COUNT" && hackathonCount >= ach.criteriaValue) {
      eligible = true;
    }

    if (eligible) {
      // 3. Unlock achievement & credit XP
      const studentAch = await prisma.studentAchievement.create({
        data: {
          userId,
          achievementId: ach.id,
          isVerified: true,
        },
        include: { achievement: true },
      });

      // Update student XP & Level
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const newXp = user.xp + ach.xpReward;
        const newLevel = Math.floor(newXp / 200) + 1;
        await prisma.user.update({
          where: { id: userId },
          data: { xp: newXp, level: newLevel },
        });
      }

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          title: `🏆 Achievement Unlocked: ${ach.name}!`,
          message: `Congratulations! You unlocked "${ach.name}" (${ach.rarity}) and earned +${ach.xpReward} XP!`,
          type: "ACHIEVEMENT",
          link: "/passport",
        },
      });

      newlyUnlocked.push(studentAch);
    }
  }

  return newlyUnlocked;
};

module.exports = {
  initAchievementsCatalog,
  evaluateAndUnlockAchievements,
};