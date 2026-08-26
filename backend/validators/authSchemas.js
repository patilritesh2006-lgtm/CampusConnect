const { z } = require("zod");

// Strong password regex: 8+ chars, min 1 uppercase, min 1 lowercase, min 1 number, min 1 special char
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\]:;"'<>,./~`|\\])[A-Za-z\d@$!%*?&#^()_\-+={}[\]:;"'<>,./~`|\\]{8,}$/;

const registerSchema = z.object({
  fullName: z
    .string({ required_error: "Full Name is required." })
    .trim()
    .min(2, "Full Name must be at least 2 characters.")
    .max(100, "Full Name cannot exceed 100 characters."),
  email: z
    .string({ required_error: "Email is required." })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address."),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, "Password must be at least 8 characters long.")
    .regex(
      strongPasswordRegex,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),
  department: z.string().trim().optional().nullable(),
  year: z.number().int().min(1).max(5).optional().nullable(),
  role: z.enum(["STUDENT", "ADMIN"]).optional().default("STUDENT"),
  collegeId: z.string().uuid().optional().nullable(),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address."),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address."),
});

const resetPasswordSchema = z.object({
  token: z.string({ required_error: "Reset token is required." }).min(10, "Invalid reset token."),
  newPassword: z
    .string({ required_error: "New password is required." })
    .min(8, "Password must be at least 8 characters long.")
    .regex(
      strongPasswordRegex,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),
});

const verifyEmailSchema = z.object({
  token: z.string({ required_error: "Verification token is required." }).min(10, "Invalid token."),
});

const resendVerificationSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address."),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
};
