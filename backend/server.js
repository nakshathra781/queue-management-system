const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
connectDB();

// Allows frontend to send requests to backend
app.use(cors());

// Allows backend to read JSON data
app.use(express.json());
app.use("/api/auth", authRoutes);

// Simple test route
app.get("/", (req, res) => {
  res.send("Queue Management System API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});