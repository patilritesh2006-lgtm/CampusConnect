const prisma = require("../config/prisma");
const { getStudentSkillGraph, addSkillEvidence } = require("../services/skillService");

const getMySkills = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const skillGraph = await getStudentSkillGraph(userId);
    return res.json({ success: true, ...skillGraph });
  } catch (err) {
    next(err);
  }
};

const addEvidence = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skillName, sourceType = "PROJECT", sourceTitle, weightPoints = 10 } = req.body;

    if (!skillName || !sourceTitle) {
      return res.status(400).json({
        success: false,
        message: "Skill name and evidence source title are required.",
      });
    }

    const updated = await addSkillEvidence(userId, skillName, {
      sourceType,
      sourceTitle,
      weightPoints: Math.min(25, Math.max(5, Number(weightPoints) || 10)),
    });

    return res.status(201).json({ success: true, studentSkill: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMySkills,
  addEvidence,
};