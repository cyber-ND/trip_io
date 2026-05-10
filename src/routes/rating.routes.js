const express = require('express')
const { rateDriver, getDriverRatings, getRatingByRide } = require('../controllers/rating.controller')
const { protect } = require('../middlewares/auth.middleware')

const router = express.Router()

// Rate a driver after a ride
router.post('/rate-driver', protect, rateDriver)

// Get ratings for a specific driver
router.get('/drivers/:driverId/ratings', getDriverRatings)

// Get rating for a specific ride
router.get('/rides/:rideId/rating', protect, getRatingByRide)

module.exports = router