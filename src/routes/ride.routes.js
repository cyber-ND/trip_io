const express = require('express');
const router = express.Router();

const {
    requestRide,
    acceptRide,
    completeRide,
    getRideHistory
} = require('../controllers/ride.controller');

router.post('/request', requestRide);
router.put('/accept/:rideId', acceptRide);
router.put('/complete/:rideId', completeRide);
router.get('/history/:userId', getRideHistory);

module.exports = router;