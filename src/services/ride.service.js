const Ride = require("../models/ride.model");
const Driver = require("../models/driver.model");
const { calculateDistance } = require("../utils/distance");
const logger = require("../utils/logger");
const { AppError } = require("../middlewares/error.middleware");

const FARE_BASE = 500;
const FARE_PER_KM = 100;

const findAndNotifyDriver = async (ride, excludeDriverUserId = null) => {
  const [lng, lat] = ride.pickup.coordinates;

  const query = {
    isAvailable: true,
    isApproved: true,
    currentLocation: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
      },
    },
  };

  if (excludeDriverUserId) query.userId = { $ne: excludeDriverUserId };

  const driver = await Driver.findOne(query);

  ride.status = "pending";
  if (driver) {
    ride.driverId = driver.userId;
    logger.info(`Ride ${ride._id} assigned to driver ${driver.userId}`);
  }
  await ride.save();

  return ride;
};

const bookRide = async ({ riderId, pickup, dropoff }) => {
  const distance = calculateDistance(pickup.coordinates, dropoff.coordinates);
  const estimated = FARE_BASE + FARE_PER_KM * distance;

  let ride = await Ride.create({
    riderId,
    pickup,
    dropoff,
    distance,
    fare: { estimated },
    status: "pending",
  });

  ride = await findAndNotifyDriver(ride);
  return ride;
};

const acceptRide = async (rideId, driverUserId) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError("Ride not found", 404);
  if (ride.status !== "pending") throw new AppError("Ride is not pending", 400);
  if (String(ride.driverId) !== String(driverUserId))
    throw new AppError("Not assigned to this driver", 403);

  ride.status = "accepted";
  await ride.save();
  return ride;
};

const rejectRide = async (rideId, driverUserId) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError("Ride not found", 404);
  if (!["pending", "accepted"].includes(ride.status))
    throw new AppError("Ride cannot be rejected at this stage", 400);
  if (String(ride.driverId) !== String(driverUserId))
    throw new AppError("Not assigned to this driver", 403);

  const prevDriverUserId = ride.driverId;
  ride.status = "rejected";
  ride.driverId = null;
  ride.rejectionCount += 1;
  await ride.save();

  return findAndNotifyDriver(ride, prevDriverUserId);
};

const startRide = async (rideId, driverUserId) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError("Ride not found", 404);
  if (ride.status !== "accepted") throw new AppError("Ride is not accepted", 400);
  if (String(ride.driverId) !== String(driverUserId))
    throw new AppError("Not assigned to this driver", 403);

  ride.status = "ongoing";
  ride.startedAt = new Date();
  await ride.save();
  return ride;
};

const completeRide = async (rideId, driverUserId) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError("Ride not found", 404);
  if (ride.status !== "ongoing") throw new AppError("Ride is not ongoing", 400);
  if (String(ride.driverId) !== String(driverUserId))
    throw new AppError("Not assigned to this driver", 403);

  ride.status = "completed";
  ride.completedAt = new Date();
  ride.fare.final = ride.fare.estimated;
  await ride.save();

  await Driver.findOneAndUpdate(
    { userId: driverUserId },
    { $inc: { totalRides: 1 } },
  );

  return ride;
};

const cancelRide = async (rideId, riderId, cancelReason) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError("Ride not found", 404);
  if (!["pending", "accepted"].includes(ride.status))
    throw new AppError("Ride cannot be cancelled at this stage", 400);
  if (String(ride.riderId) !== String(riderId))
    throw new AppError("Not your ride", 403);

  ride.status = "cancelled";
  ride.cancelledAt = new Date();
  if (cancelReason) ride.cancelReason = cancelReason;
  await ride.save();
  return ride;
};

const getRideById = async (rideId) => {
  const ride = await Ride.findById(rideId)
    .populate("riderId", "name email phoneNumber profilePhoto")
    .populate("driverId", "name email phoneNumber profilePhoto");
  if (!ride) throw new AppError("Ride not found", 404);
  return ride;
};

const getMyRides = async (userId, role, { page = 1, limit = 10 } = {}) => {
  const filter = role === "driver" ? { driverId: userId } : { riderId: userId };
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Ride.find(filter)
      .populate("riderId", "name email")
      .populate("driverId", "name email phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Ride.countDocuments(filter),
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

const getAllRides = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Ride.find()
      .populate("riderId", "name email")
      .populate("driverId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Ride.countDocuments(),
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

module.exports = {
  bookRide,
  acceptRide,
  rejectRide,
  startRide,
  completeRide,
  cancelRide,
  getRideById,
  getMyRides,
  getAllRides,
};
