const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ======================================================
// ROUTES
// ======================================================
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

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