const { body } = require('express-validator')

const initiatePaymentRules = [
  body('rideId').isMongoId().withMessage('Valid ride ID is required'),
  body('method')
    .optional()
    .isIn(['card', 'wallet', 'cash'])
    .withMessage('Method must be card, wallet, or cash'),
]

module.exports = { initiatePaymentRules }
