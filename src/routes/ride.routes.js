const router = require('express').Router()
const rideController = require('../controllers/ride.controller')
const { protect } = require('../middlewares/auth.middleware')
const { allowRoles } = require('../middlewares/role.middleware')
const { validate } = require('../middlewares/validate.middleware')
const { bookRideRules, cancelRideRules } = require('../validators/ride.validator')

router.post('/', protect, allowRoles('rider'), bookRideRules, validate, rideController.bookRide)
router.get('/my', protect, rideController.getMyRides)
router.get('/', protect, allowRoles('admin'), rideController.getAllRides)
router.get('/:id', protect, rideController.getRideById)
router.patch('/:id/accept', protect, allowRoles('driver'), rideController.acceptRide)
router.patch('/:id/reject', protect, allowRoles('driver'), rideController.rejectRide)
router.patch('/:id/start', protect, allowRoles('driver'), rideController.startRide)
router.patch('/:id/complete', protect, allowRoles('driver'), rideController.completeRide)
router.patch('/:id/cancel', protect, allowRoles('rider'), cancelRideRules, validate, rideController.cancelRide)

module.exports = router
