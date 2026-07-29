const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Allows frontend to send requests to backend
app.use(cors());

// Allows backend to read JSON data
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
  res.send("Queue Management System API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});