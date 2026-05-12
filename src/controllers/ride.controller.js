const rideService = require('../services/ride.service')
const apiResponse = require('../utils/apiResponse')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const applyPhoneVisibility = (ride) => {
  const rideObj = ride.toObject ? ride.toObject() : ride
  const exposePhone = ['accepted', 'ongoing', 'completed'].includes(rideObj.status)
  if (!exposePhone && rideObj.driverId) delete rideObj.driverId.phoneNumber
  return rideObj
}

const bookRide = asyncHandler(async (req, res) => {
  const { pickup, dropoff } = req.body
  const ride = await rideService.bookRide({ riderId: req.user._id, pickup, dropoff })
  return apiResponse.success(res, 'Ride booked', { ride }, 201)
})

const acceptRide = asyncHandler(async (req, res) => {
  const ride = await rideService.acceptRide(req.params.id, req.user._id)
  return apiResponse.success(res, 'Ride accepted', { ride })
})

const rejectRide = asyncHandler(async (req, res) => {
  const ride = await rideService.rejectRide(req.params.id, req.user._id)
  return apiResponse.success(res, 'Ride rejected', { ride })
})

const startRide = asyncHandler(async (req, res) => {
  const ride = await rideService.startRide(req.params.id, req.user._id)
  return apiResponse.success(res, 'Ride started', { ride })
})

const completeRide = asyncHandler(async (req, res) => {
  const ride = await rideService.completeRide(req.params.id, req.user._id)
  return apiResponse.success(res, 'Ride completed', { ride })
})

const cancelRide = asyncHandler(async (req, res) => {
  const { cancelReason } = req.body
  const ride = await rideService.cancelRide(req.params.id, req.user._id, cancelReason)
  return apiResponse.success(res, 'Ride cancelled', { ride })
})

const getRideById = asyncHandler(async (req, res) => {
  const ride = await rideService.getRideById(req.params.id)
  return apiResponse.success(res, 'Ride fetched', { ride: applyPhoneVisibility(ride) })
})

const getMyRides = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const result = await rideService.getMyRides(req.user._id, req.user.role, { page, limit })
  result.items = result.items.map(applyPhoneVisibility)
  return apiResponse.success(res, 'Rides fetched', result)
})

const getAllRides = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const result = await rideService.getAllRides({ page, limit })
  return apiResponse.success(res, 'All rides fetched', result)
})

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
}
