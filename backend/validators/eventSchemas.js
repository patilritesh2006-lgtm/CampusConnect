const { z } = require('zod');

const createEventSchema = z.object({
  title: z
    .string({ required_error: 'Event title is required.' })
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(200, 'Title cannot exceed 200 characters.'),
  description: z
    .string({ required_error: 'Description is required.' })
    .trim()
    .min(10, 'Description must be at least 10 characters.'),
  venue: z
    .string({ required_error: 'Venue is required.' })
    .trim()
    .min(2, 'Venue must be at least 2 characters.'),
  eventDate: z
    .string({ required_error: 'Event date is required.' })
    .datetime({ offset: true, message: 'Please provide a valid ISO datetime format.' })
    .or(z.string().min(1, 'Event date is required.')),
  category: z.string().trim().optional().default('Workshop'),
  capacity: z.coerce.number().int().positive('Capacity must be greater than 0.').optional().default(100),
  registrationDeadline: z.string().optional().nullable(),
  posterUrl: z.string().url('Poster URL must be a valid URL.').optional().nullable().or(z.literal('')),
  collegeId: z.string().optional().nullable(),
});

const updateEventSchema = createEventSchema.partial();

module.exports = {
  createEventSchema,
  updateEventSchema,
};
