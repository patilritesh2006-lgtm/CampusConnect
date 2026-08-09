import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Path to your Prisma schema
  schema: "./prisma/schema.prisma",

  // Prisma migrations folder
  migrations: {
    path: "./prisma/migrations",
  },

  // Database connection
  datasource: {
    url: env("DATABASE_URL"),
  },

  // Query engine
  engine: "classic",
});