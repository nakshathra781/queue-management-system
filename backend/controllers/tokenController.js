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

    /*
      Generate the next token number safely.

      We read the latest created token instead of counting today's tokens,
      because tokenNumber may be unique in MongoDB. Resetting to T001 each
      day can cause a duplicate-key error.
    */
    const latestToken = await Token.findOne()
      .sort({ createdAt: -1 })
      .select("tokenNumber");

    let nextTokenNumber = 1;

    if (latestToken?.tokenNumber) {
      const numericPart = parseInt(
        latestToken.tokenNumber.replace(/\D/g, ""),
        10
      );

      if (!Number.isNaN(numericPart)) {
        nextTokenNumber = numericPart + 1;
      }
    }

    const tokenNumber = `T${String(nextTokenNumber).padStart(3, "0")}`;

    const token = await Token.create({
      tokenNumber,
      user: req.user._id,
      service: serviceId,
      queuePosition: waitingCount + 1,
      status: "waiting",
    });

    const populatedToken = await Token.findById(token._id)
      .populate("user", "name email")
      .populate("service", "name averageServiceTime");

    return res.status(201).json({
      message: "Token generated successfully",
      token: populatedToken,
    });
  } catch (error) {
    console.error("Generate token error:", error);

    return res.status(500).json({
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

    return res.status(200).json({
      count: tokens.length,
      tokens,
    });
  } catch (error) {
    console.error("Get my tokens error:", error);

    return res.status(500).json({
      message: "Failed to fetch tokens",
      error: error.message,
    });
  }
};

// Admin views the active queue
const getQueue = async (req, res) => {
  try {
    const tokens = await Token.find({
      status: { $in: ["waiting", "called"] },
    })
      .populate("user", "name email")
      .populate("service", "name averageServiceTime")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      count: tokens.length,
      tokens,
    });
  } catch (error) {
    console.error("Get queue error:", error);

    return res.status(500).json({
      message: "Failed to fetch queue",
      error: error.message,
    });
  }
};

// Admin updates a token's status
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

    if (status === "skipped") {
      token.skippedAt = new Date();
    }

    if (status === "cancelled") {
      token.cancelledAt = new Date();
    }

    await token.save();

    const updatedToken = await Token.findById(token._id)
      .populate("user", "name email")
      .populate("service", "name averageServiceTime");

    return res.status(200).json({
      message: `Token marked as ${status}`,
      token: updatedToken,
    });
  } catch (error) {
    console.error("Update token status error:", error);

    return res.status(500).json({
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