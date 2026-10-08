// Load .env FIRST so process.env is filled before anything else runs.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Fail early with a clear message if a required variable is missing.
["MONGODB_URI", "JWT_SECRET", "CLIENT_URL"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    console.error("Copy .env.example to .env and fill in the values.");
    process.exit(1);
  }
});

const app = express();

// CORS: only allow the React frontend (CLIENT_URL) to call this API.
app.use(
  cors({
    origin: process.env.CLIENT_URL.split(",").map((url) => url.trim()),
    credentials: true,
  })
);

app.use(express.json()); // read JSON request bodies
app.use(morgan("dev")); // log each request in the terminal

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "A2Z Broking API is running" });
});

// Routes
app.use("/api/auth", authRoutes);

// These two MUST come last.
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
