const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CampusConnect API Documentation",
      version: "2.0.0",
      description:
        "Official OpenAPI 3.0 Documentation for CampusConnect — College Event & Student Activity Platform.",
      contact: {
        name: "CampusConnect Team",
        url: "https://github.com/patilritesh2006-lgtm/CampusConnect",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your Bearer access token",
        },
      },
    },
    paths: {
      "/health": {
        get: {
          summary: "System Health & Monitoring Check",
          tags: ["Monitoring"],
          responses: {
            200: { description: "API and PostgreSQL Database are operational" },
            503: { description: "Service degraded / Database unavailable" },
          },
        },
      },
      "/auth/register": {
        post: {
          summary: "Register new student or administrator",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["fullName", "email", "password"],
                  properties: {
                    fullName: { type: "string", example: "Jane Doe" },
                    email: { type: "string", example: "jane@campusconnect.edu" },
                    password: { type: "string", example: "SecurePass123!@#" },
                    department: { type: "string", example: "Computer Science" },
                    year: { type: "integer", example: 3 },
                    role: { type: "string", enum: ["STUDENT", "ADMIN", "FACULTY", "EVENT_COORDINATOR"], example: "STUDENT" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Account created successfully with access token and refresh cookie" },
            400: { description: "Zod validation error or weak password" },
            409: { description: "Email address already registered" },
          },
        },
      },
      "/auth/login": {
        post: {
          summary: "Authenticate user & issue dual tokens",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "student@campusconnect.edu" },
                    password: { type: "string", example: "Password123!@#" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Authentication successful, returns access token & sets HTTP-only cookie" },
            401: { description: "Invalid credentials" },
            403: { description: "Account temporarily locked due to 5 consecutive failures" },
          },
        },
      },
      "/auth/refresh": {
        post: {
          summary: "Rotate refresh token & issue fresh access token",
          tags: ["Authentication"],
          responses: {
            200: { description: "Token rotated successfully" },
            401: { description: "Refresh token missing or revoked" },
          },
        },
      },
      "/auth/me": {
        get: {
          summary: "Get current authenticated user profile",
          tags: ["Authentication"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Current user profile" },
            401: { description: "Unauthorized / Missing token" },
          },
        },
      },
      "/events": {
        get: {
          summary: "Get all campus events",
          tags: ["Events"],
          responses: {
            200: { description: "List of all published events" },
          },
        },
        post: {
          summary: "Create a new campus event",
          tags: ["Events"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "description", "venue", "eventDate"],
                  properties: {
                    title: { type: "string", example: "National AI Hackathon" },
                    description: { type: "string", example: "36-hour coding challenge." },
                    venue: { type: "string", example: "Tech Auditorium" },
                    eventDate: { type: "string", format: "date-time" },
                    category: { type: "string", example: "Hackathon" },
                    capacity: { type: "integer", example: 100 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Event created successfully" },
            400: { description: "Zod validation error" },
            403: { description: "Forbidden / Requires Admin role" },
          },
        },
      },
      "/registrations": {
        post: {
          summary: "Register authenticated student for an event",
          tags: ["Registrations"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["eventId"],
                  properties: {
                    eventId: { type: "string", format: "uuid" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Registered successfully" },
            400: { description: "Already registered or event full" },
          },
        },
      },
      "/attendance/events/{eventId}/rotating-qr": {
        get: {
          summary: "Get live 30-second rotating HMAC QR token for projector",
          tags: ["Attendance"],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "eventId", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Live rotating QR token and countdown seconds" },
          },
        },
      },
      "/attendance/checkin-qr": {
        post: {
          summary: "Student scans live rotating QR token to check in (+50 XP)",
          tags: ["Attendance"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["eventId", "qrToken"],
                  properties: {
                    eventId: { type: "string" },
                    qrToken: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Attendance confirmed & XP awarded" },
            400: { description: "Expired token or not registered" },
          },
        },
      },
      "/certificates/verify/{code}": {
        get: {
          summary: "Public certificate authenticity verification",
          tags: ["Certificates"],
          parameters: [
            { in: "path", name: "code", required: true, schema: { type: "string", example: "CC-2026-AIHA-7F3A9C" } },
          ],
          responses: {
            200: { description: "Authentic certificate with LinkedIn sharing URL" },
            404: { description: "Certificate record not found" },
          },
        },
      },
      "/users/portfolio/{username}": {
        get: {
          summary: "Public student digital portfolio (Zero PII leaks)",
          tags: ["Portfolio & Gamification"],
          parameters: [
            { in: "path", name: "username", required: true, schema: { type: "string", example: "riteshpatil" } },
          ],
          responses: {
            200: { description: "Public portfolio details with verified badges and certificates" },
            404: { description: "Portfolio not found or set to private" },
          },
        },
      },
      "/ai/recommendations": {
        get: {
          summary: "Personalized AI event recommendations per student",
          tags: ["AI Assistant"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Curated events scored by match percentage" },
          },
        },
      },
      "/ai/assistant": {
        post: {
          summary: "Natural-language query handler for Campus AI",
          tags: ["AI Assistant"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["message"],
                  properties: {
                    message: { type: "string", example: "What hackathons are happening?" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Structured AI answer with suggested action links" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
