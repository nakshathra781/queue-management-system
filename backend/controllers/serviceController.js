const Service = require("../models/Service");

const createService = async (req, res) => {
  try {
    const { name, description, averageServiceTime } = req.body;

    if (!name || !averageServiceTime) {
      return res.status(400).json({
        message: "Service name and average service time are required",
      });
    }

    const existingService = await Service.findOne({ name });

    if (existingService) {
      return res.status(400).json({
        message: "Service already exists",
      });
    }

    const service = await Service.create({
      name,
      description,
      averageServiceTime,
    });

    res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create service",
      error: error.message,
    });
  }
};

const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

module.exports = {
  createService,
  getServices,
};