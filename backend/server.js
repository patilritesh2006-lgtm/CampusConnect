const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

// Allow frontend from Vite development ports
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  })
);

app.use(express.json());

// ======================================================
// ROUTES
// ======================================================

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CampusConnect Backend API is running.",
  });
});

// ======================================================
// SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});