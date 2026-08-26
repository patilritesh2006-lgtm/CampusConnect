const { z } = require("zod");

const createRegistrationSchema = z.object({
  event_id: z.string({ required_error: "Event ID is required." }).min(1, "Event ID cannot be empty.").optional(),
  eventId: z.string({ required_error: "Event ID is required." }).min(1, "Event ID cannot be empty.").optional(),
  user_id: z.string().optional(),
}).refine((data) => data.event_id || data.eventId, {
  message: "Event ID is required.",
  path: ["eventId"],
});

module.exports = {
  createRegistrationSchema,
};
