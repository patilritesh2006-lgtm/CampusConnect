const prisma = require("../config/prisma");

/**
 * Institutional Audit Logger: records administrative, credential, and attendance mutations.
 */
const logAuditEvent = async ({
  collegeId,
  actorId,
  action,
  entity,
  entityId,
  ipAddress = null,
  metadata = {},
}) => {
  try {
    if (!collegeId || !actorId || !action || !entity) return null;

    const log = await prisma.auditLog.create({
      data: {
        collegeId,
        actorId,
        action,
        entity,
        entityId: String(entityId),
        ipAddress,
        metadata,
      },
    });

    return log;
  } catch (error) {
    console.error("Audit log error:", error);
    return null;
  }
};

module.exports = {
  logAuditEvent,
};