const { z } = require("zod");

const createAnnouncementSchema = z.object({
  title: z
    .string({ required_error: "Announcement title is required." })
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title cannot exceed 200 characters."),
  content: z
    .string({ required_error: "Announcement content is required." })
    .trim()
    .min(5, "Content must be at least 5 characters."),
  category: z.string().trim().optional().default("General"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional().default("NORMAL"),
});

module.exports = {
  createAnnouncementSchema,
};
