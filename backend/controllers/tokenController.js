const Token = require("../models/Token");
const Service = require("../models/Service");

// Customer generates a token
const generateToken = async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        message: "Service ID is required",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service || !service.isActive) {
      return res.status(404).json({
        message: "Service not found or inactive",
      });
    }

    const existingToken = await Token.findOne({
      user: req.user._id,
      service: serviceId,
      status: { $in: ["waiting", "called"] },
    });

    if (existingToken) {
      return res.status(400).json({
        message: "You already have an active token for this service",
      });
    }

    const waitingCount = await Token.countDocuments({
      service: serviceId,
      status: "waiting",
    });

    const totalTokensToday = await Token.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    const tokenNumber = `T${String(totalTokensToday + 1).padStart(3, "0")}`;

    const token = await Token.create({
      tokenNumber,
      user: req.user._id,
      service: serviceId,
      queuePosition: waitingCount + 1,
    });

    const populatedToken = await Token.findById(token._id)
      .populate("user", "name email")
      .populate("service", "name averageServiceTime");

    res.status(201).json({
      message: "Token generated successfully",
      token: populatedToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate token",
      error: error.message,
    });
  }
};

// Customer views their tokens
const getMyTokens = async (req, res) => {
  try {
    const tokens = await Token.find({
      user: req.user._id,
    })
      .populate("service", "name averageServiceTime")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: tokens.length,
      tokens,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tokens",
      error: error.message,
    });
  }
};

// Admin views complete queue
const getQueue = async (req, res) => {
  try {
    const tokens = await Token.find({
      status: { $in: ["waiting", "called"] },
    })
      .populate("user", "name email")
      .populate("service", "name averageServiceTime")
      .sort({ createdAt: 1 });

    res.status(200).json({
      count: tokens.length,
      tokens,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch queue",
      error: error.message,
    });
  }
};
const updateTokenStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "called",
      "completed",
      "skipped",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Status must be called, completed, skipped, or cancelled",
      });
    }

    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    token.status = status;

    if (status === "called") {
      token.calledAt = new Date();
    }

    if (status === "completed") {
      token.completedAt = new Date();
    }

    await token.save();

    const updatedToken = await Token.findById(token._id)
      .populate("user", "name email")
      .populate("service", "name averageServiceTime");

    res.status(200).json({
      message: `Token marked as ${status}`,
      token: updatedToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update token status",
      error: error.message,
    });
  }
};

module.exports = {
  generateToken,
  getMyTokens,
  getQueue,
  updateTokenStatus,
};