const router = require('express').Router()
const paymentController = require('../controllers/payment.controller')
const { protect } = require('../middlewares/auth.middleware')
const { allowRoles } = require('../middlewares/role.middleware')
const { validate } = require('../middlewares/validate.middleware')
const { initiatePaymentRules } = require('../validators/payment.validator')

router.post('/webhook/paystack', paymentController.paystackWebhook)
router.post('/', protect, allowRoles('rider'), initiatePaymentRules, validate, paymentController.initiatePayment)
router.get('/my', protect, paymentController.getMyPayments)
router.get('/ride/:rideId', protect, paymentController.getPaymentByRide)
router.get('/', protect, allowRoles('admin'), paymentController.getAllPayments)

module.exports = router
