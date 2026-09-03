const { getInstitutionalIntelligence } = require("../services/intelligenceService");

const getIntelligenceReport = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;
    const report = await getInstitutionalIntelligence(
      req.user.role === "SUPER_ADMIN" ? undefined : collegeId
    );
    return res.json({ success: true, ...report });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIntelligenceReport,
};