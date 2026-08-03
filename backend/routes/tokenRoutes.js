const express = require("express");

const {
  generateToken,
  getMyTokens,
  getQueue,
  updateTokenStatus,
} = require("../controllers/tokenController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Customer routes
router.post("/", protect, generateToken);
router.get("/my-tokens", protect, getMyTokens);

// Admin route
router.get("/queue", protect, adminOnly, getQueue);
router.put("/:id", protect, adminOnly, updateTokenStatus);

module.exports = router;