const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

dotenv.config();
const app = express();

// CORS allowed origins

const allowedOrigins = ["http://localhost:5173"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// MongoDB connection

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API routes

app.use("/api", authRoutes);
app.use("/api/posts", postRoutes);

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Test route

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server

const PORT = process.env.PORT || 5004;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
