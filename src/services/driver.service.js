const Driver = require("../models/driver.model");
const logger = require("../utils/logger");

const createDriverProfile = async (userId, data) => {
  const existing = await Driver.findOne({ userId });
  if (existing) throw new Error("Driver profile already exists");
  const driver = await Driver.create({ userId, ...data });
  logger.info(`Driver profile created for user ${userId}`);
  return driver;
};

const toggleAvailability = async (userId) => {
  const driver = await Driver.findOne({ userId });
  if (!driver) throw new Error("Driver profile not found");
  driver.isAvailable = !driver.isAvailable;
  await driver.save();
  return driver;
};

const approveDriver = async (driverId) => {
  const driver = await Driver.findByIdAndUpdate(
    driverId,
    { isApproved: true },
    { new: true },
  );
  if (!driver) throw new Error("Driver not found");
  return driver;
};

const getDriverByUserId = async (userId) => {
  const driver = await Driver.findOne({ userId }).populate(
    "userId",
    "name email phoneNumber profilePhoto",
  );
  if (!driver) throw new Error("Driver profile not found");
  return driver;
};

const getAllDrivers = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Driver.find()
      .populate("userId", "name email phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Driver.countDocuments(),
  ]);
  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

const updateDriverLocation = async (userId, coordinates) => {
  const driver = await Driver.findOneAndUpdate(
    { userId },
    { currentLocation: { type: "Point", coordinates } },
    { new: true },
  );
  if (!driver) throw new Error("Driver profile not found");
  return driver;
};

module.exports = {
  createDriverProfile,
  toggleAvailability,
  approveDriver,
  getDriverByUserId,
  getAllDrivers,
  updateDriverLocation,
};
