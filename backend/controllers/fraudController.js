const { getFraudIncidents, resolveIncident } = require("../services/fraudService");

const getAlerts = async (req, res, next) => {
  try {
    const { riskLevel, reviewStatus } = req.query;
    const collegeId = req.user.collegeId;

    const incidents = await getFraudIncidents({
      collegeId: req.user.role === "SUPER_ADMIN" ? undefined : collegeId,
      riskLevel,
      reviewStatus,
    });

    return res.json({ success: true, incidents, count: incidents.length });
  } catch (err) {
    next(err);
  }
};

const resolveAlert = async (req, res, next) => {
  try {
    const { incidentId, status, reviewStatus } = req.body;
    const finalStatus = status || reviewStatus;
    if (!incidentId || !finalStatus) {
      return res.status(400).json({
        success: false,
        message: "Incident ID and resolution status are required.",
      });
    }

    const updated = await resolveIncident(incidentId, finalStatus, req.user);
    return res.json({ success: true, incident: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAlerts,
  resolveAlert,
};