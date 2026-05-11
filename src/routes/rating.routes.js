const router = require('express').Router()
const ratingController = require('../controllers/rating.controller')
const { protect } = require('../middlewares/auth.middleware')
const { allowRoles } = require('../middlewares/role.middleware')

router.post('/', protect, allowRoles('rider'), ratingController.rateDriver)
router.get('/driver/:driverId', protect, ratingController.getDriverRatings)
router.get('/ride/:rideId', protect, ratingController.getRatingByRide)

module.exports = router
