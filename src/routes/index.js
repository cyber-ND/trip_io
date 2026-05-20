const router = require('express').Router()

router.use('/auth', require('./auth.routes'))
router.use('/users', require('./user.routes'))
router.use('/drivers', require('./driver.routes'))
router.use('/rides', require('./ride.routes'))
router.use('/payments', require('./payment.routes'))
router.use('/ratings', require('./rating.routes'))

module.exports = router
