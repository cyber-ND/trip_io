const router = require('express').Router()
const driverController = require('../controllers/driver.controller')
const { protect } = require('../middlewares/auth.middleware')
const { allowRoles } = require('../middlewares/role.middleware')
const { validate } = require('../middlewares/validate.middleware')
const { createProfileRules, updateLocationRules } = require('../validators/driver.validator')

router.post('/profile', protect, allowRoles('driver'), createProfileRules, validate, driverController.createDriverProfile)
router.get('/profile', protect, allowRoles('driver'), driverController.getDriverProfile)
router.patch('/availability', protect, allowRoles('driver'), driverController.toggleAvailability)
router.patch('/location', protect, allowRoles('driver'), updateLocationRules, validate, driverController.updateDriverLocation)
router.get('/', protect, allowRoles('admin'), driverController.getAllDrivers)
router.patch('/:id/approve', protect, allowRoles('admin'), driverController.approveDriver)

module.exports = router
