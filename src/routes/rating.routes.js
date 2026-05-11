const router = require('express').Router()
const ratingController = require('../controllers/rating.controller')
const { protect } = require('../middlewares/auth.middleware')
const { allowRoles } = require('../middlewares/role.middleware')
const { validate } = require('../middlewares/validate.middleware')
const { rateDriverRules } = require('../validators/rating.validator')

router.post('/', protect, allowRoles('rider'), rateDriverRules, validate, ratingController.rateDriver)
router.get('/driver/:driverId', protect, ratingController.getDriverRatings)
router.get('/ride/:rideId', protect, ratingController.getRatingByRide)

module.exports = router
