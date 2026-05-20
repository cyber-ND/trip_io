const router = require('express').Router()
const authController = require('../controllers/auth.controller')
const { protect } = require('../middlewares/auth.middleware')
const { validate } = require('../middlewares/validate.middleware')
const { authLimiter } = require('../middlewares/rateLimiter.middleware')
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  resendVerificationRules,
} = require('../validators/auth.validator')

router.post('/register', authLimiter, registerRules, validate, authController.register)
router.post('/login', authLimiter, loginRules, validate, authController.login)
router.post('/google', authController.googleLogin)
router.post('/refresh', authController.refreshToken)
router.post('/logout', protect, authController.logout)
router.post('/forgot-password', forgotPasswordRules, validate, authController.forgotPassword)
router.post('/reset-password/:token', resetPasswordRules, validate, authController.resetPassword)
router.post('/verify-email/:token', authController.verifyEmail)
router.post('/resend-verification', resendVerificationRules, validate, authController.resendVerification)

module.exports = router
