const express = require('express');
const router = express.Router();

// Import all route files
const authRoute = require('./auth.routes');
const userRoute = require('./user.route');
const driverRoute = require('./driver.route');
const rideRoute = require('./ride.route');
const paymentRoute = require('./payment.route');
const ratingRoute = require('./rating.route');

// Combine routes
router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/drivers', driverRoute);
router.use('/rides', rideRoute);
router.use('/payments', paymentRoute);
router.use('/ratings', ratingRoute);

module.exports = router;