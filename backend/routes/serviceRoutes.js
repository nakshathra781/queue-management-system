const express = require("express");

const {
  createService,
  getServices,
} = require("../controllers/serviceController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getServices);
router.post("/", protect, adminOnly, createService);

module.exports = router;