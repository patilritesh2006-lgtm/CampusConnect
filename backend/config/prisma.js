const path = require("path");
const dotenv = require("dotenv");

// Explicitly load .env from backend directory
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:ritesh@localhost:5432/campusconnect?schema=public";

// Ensure process.env has DATABASE_URL
process.env.DATABASE_URL = dbUrl;

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

module.exports = prisma;