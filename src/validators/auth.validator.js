const { body } = require('express-validator')

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['rider', 'driver']).withMessage('Role must be rider or driver'),
  body('phoneNumber').optional().trim(),
]

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]

const forgotPasswordRules = [
  body('email').isEmail().withMessage('Valid email is required'),
]

const resetPasswordRules = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
]

const resendVerificationRules = [
  body('email').isEmail().withMessage('Valid email is required'),
]

module.exports = {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  resendVerificationRules,
}
