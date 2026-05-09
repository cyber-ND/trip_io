const ratingService = require('../services/rating.service')
const apiResponse = require('../utils/apiResponse')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const rateDriver = asyncHandler(async (req, res) => {
  const { rideId, stars, comment } = req.body
  const rating = await ratingService.rateDriver({
    rideId,
    riderId: req.user._id,
    stars,
    comment,
  })
  return apiResponse.success(res, 'Driver rated', { rating }, 201)
})

const getDriverRatings = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const result = await ratingService.getDriverRatings(req.params.driverId, { page, limit })
  return apiResponse.success(res, 'Ratings fetched', result)
})

const getRatingByRide = asyncHandler(async (req, res) => {
  const rating = await ratingService.getRatingByRide(req.params.rideId)
  return apiResponse.success(res, 'Rating fetched', { rating })
})

module.exports = { rateDriver, getDriverRatings, getRatingByRide }
