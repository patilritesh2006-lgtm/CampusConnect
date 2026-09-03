const prisma = require("../config/prisma");

/**
 * Adds verifiable evidence to a student's skill graph and recalculates proficiency.
 */
const addSkillEvidence = async (userId, skillName, { sourceType, sourceTitle, sourceId, weightPoints = 15 }) => {
  if (!userId || !skillName) return null;

  const normalizedName = skillName.trim();

  // 1. Find or create master Skill
  let skill = await prisma.skill.findUnique({
    where: { name: normalizedName },
  });

  if (!skill) {
    let category = "TECHNICAL";
    const lower = normalizedName.toLowerCase();
    if (lower.includes("leader") || lower.includes("management") || lower.includes("organ")) category = "LEADERSHIP";
    else if (lower.includes("design") || lower.includes("ui") || lower.includes("ux")) category = "DESIGN";
    else if (lower.includes("speak") || lower.includes("present") || lower.includes("comm")) category = "COMMUNICATION";

    skill = await prisma.skill.create({
      data: {
        name: normalizedName,
        category,
        description: `Verified ${category.toLowerCase()} competency in ${normalizedName}.`,
      },
    });
  }

  // 2. Find or create StudentSkill
  let studentSkill = await prisma.studentSkill.findUnique({
    where: {
      userId_skillId: {
        userId,
        skillId: skill.id,
      },
    },
    include: { evidences: true },
  });

  if (!studentSkill) {
    studentSkill = await prisma.studentSkill.create({
      data: {
        userId,
        skillId: skill.id,
        score: 40,
        proficiency: "BEGINNER",
        isVerified: true,
        evidenceCount: 0,
      },
      include: { evidences: true },
    });
  }

  // 3. Prevent duplicate evidence from the exact same source
  const existingEvidence = await prisma.skillEvidence.findFirst({
    where: {
      studentSkillId: studentSkill.id,
      sourceType,
      sourceTitle,
      sourceId: sourceId || undefined,
    },
  });

  if (!existingEvidence) {
    await prisma.skillEvidence.create({
      data: {
        studentSkillId: studentSkill.id,
        skillId: skill.id,
        sourceType,
        sourceTitle,
        sourceId: sourceId || null,
        weightPoints,
      },
    });
  }

  // 4. Recalculate Evidence Count & Proficiency Score
  const allEvidences = await prisma.skillEvidence.findMany({
    where: { studentSkillId: studentSkill.id },
  });

  const count = allEvidences.length;
  const hasCertificate = allEvidences.some((e) => e.sourceType === "CERTIFICATE" || e.sourceType === "CREDENTIAL");
  const hasHackathon = allEvidences.some((e) => e.sourceType === "HACKATHON");

  let calculatedScore = Math.min(
    100,
    35 + count * 15 + (hasCertificate ? 20 : 0) + (hasHackathon ? 15 : 0)
  );

  let proficiency = "BEGINNER";
  if (calculatedScore >= 90) proficiency = "EXPERT";
  else if (calculatedScore >= 75) proficiency = "ADVANCED";
  else if (calculatedScore >= 55) proficiency = "INTERMEDIATE";

  const updatedStudentSkill = await prisma.studentSkill.update({
    where: { id: studentSkill.id },
    data: {
      score: calculatedScore,
      proficiency,
      evidenceCount: count,
      isVerified: count > 0,
    },
    include: {
      skill: true,
      evidences: true,
    },
  });

  return updatedStudentSkill;
};

/**
 * Returns full skill graph breakdown for a student.
 */
const getStudentSkillGraph = async (userId) => {
  const studentSkills = await prisma.studentSkill.findMany({
    where: { userId },
    include: {
      skill: true,
      evidences: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { score: "desc" },
  });

  const summary = {
    totalSkills: studentSkills.length,
    verifiedSkills: studentSkills.filter((s) => s.isVerified).length,
    expertSkills: studentSkills.filter((s) => s.proficiency === "EXPERT" || s.proficiency === "ADVANCED").length,
    totalEvidenceCount: studentSkills.reduce((acc, s) => acc + s.evidenceCount, 0),
    topSkills: studentSkills.slice(0, 5).map((s) => ({
      name: s.skill.name,
      category: s.skill.category,
      score: s.score,
      proficiency: s.proficiency,
      evidenceCount: s.evidenceCount,
    })),
  };

  return { summary, skills: studentSkills };
};

module.exports = {
  addSkillEvidence,
  getStudentSkillGraph,
};