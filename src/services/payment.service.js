const Payment = require("../models/payment.model")
const Ride = require("../models/ride.model")
const { AppError } = require("../middlewares/error.middleware")

const initiatePayment = async ({ rideId, riderId, method }) => {
  const ride = await Ride.findById(rideId)
  if (!ride) throw new AppError("Ride not found", 404)
  if (ride.status !== "completed") throw new AppError("Ride is not completed", 400)
  if (String(ride.riderId) !== String(riderId)) throw new AppError("Not your ride", 403)
  if (!ride.driverId) throw new AppError("No driver assigned to this ride", 400)

  const existing = await Payment.findOne({ rideId })
  if (existing) throw new AppError("Payment already initiated for this ride", 400)

  const payment = await Payment.create({
    rideId,
    riderId,
    driverId: ride.driverId,
    amount: ride.fare.final,
    method: method || "cash",
    status: "pending",
  })

  return payment
}

const getPaymentByRide = async (rideId) => {
  const payment = await Payment.findOne({ rideId })
    .populate("riderId", "name email")
    .populate("driverId", "name email")
  if (!payment) throw new AppError("Payment not found for this ride", 404)
  return payment
}

const getMyPayments = async (userId, role, { page = 1, limit = 10 } = {}) => {
  const filter = role === "driver" ? { driverId: userId } : { riderId: userId }
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate("rideId", "pickup dropoff status fare")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Payment.countDocuments(filter),
  ])
  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  }
}

const getAllPayments = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Payment.find()
      .populate("riderId", "name email")
      .populate("driverId", "name email")
      .populate("rideId", "pickup dropoff status fare")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Payment.countDocuments(),
  ])
  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  }
}

module.exports = { initiatePayment, getPaymentByRide, getMyPayments, getAllPayments }
