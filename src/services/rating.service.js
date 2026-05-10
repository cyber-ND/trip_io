const Rating = require("../models/rating.model");
const Ride = require("../models/ride.model");

const rateDriver = async ({ rideId, riderId, stars, comment }) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new Error("Ride not found");
  if (ride.status !== "completed")
    throw new Error("Can only rate a completed ride");
  if (String(ride.riderId) !== String(riderId))
    throw new Error("Not your ride");
  if (!ride.driverId) throw new Error("No driver assigned to this ride");

  const existing = await Rating.findOne({ rideId });
  if (existing) throw new Error("Ride has already been rated");

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
  if (!rating) throw new Error("Rating not found for this ride");
  return rating;
};

module.exports = { rateDriver, getDriverRatings, getRatingByRide };
