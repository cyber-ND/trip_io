const Rating = require("../models/rating.model");
const Ride = require("../models/ride.model");
const { AppError } = require("../middlewares/error.middleware");

const rateDriver = async ({ rideId, riderId, stars, comment }) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError("Ride not found", 404);
  if (ride.status !== "completed")
    throw new AppError("Can only rate a completed ride", 400);
  if (String(ride.riderId) !== String(riderId))
    throw new AppError("Not your ride", 403);
  if (!ride.driverId) throw new AppError("No driver assigned to this ride", 400);

  const existing = await Rating.findOne({ rideId });
  if (existing) throw new AppError("Ride has already been rated", 400);

  const rating = await Rating.create({
    rideId,
    riderId,
    driverId: ride.driverId,
    stars,
    comment,
  });
  return rating;
};

const getDriverRatings = async (driverId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Rating.find({ driverId })
      .populate("riderId", "name profilePhoto")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Rating.countDocuments({ driverId }),
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

const getRatingByRide = async (rideId) => {
  const rating = await Rating.findOne({ rideId })
    .populate("riderId", "name profilePhoto")
    .populate("driverId", "name");
  if (!rating) throw new AppError("Rating not found for this ride", 404);
  return rating;
};

module.exports = { rateDriver, getDriverRatings, getRatingByRide };
