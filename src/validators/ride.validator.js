const { body } = require('express-validator')

const bookRideRules = [
  body('pickup.address').trim().notEmpty().withMessage('Pickup address is required'),
  body('pickup.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Pickup coordinates must be [longitude, latitude]'),
  body('dropoff.address').trim().notEmpty().withMessage('Dropoff address is required'),
  body('dropoff.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Dropoff coordinates must be [longitude, latitude]'),
]

const cancelRideRules = [
  body('cancelReason').optional().trim(),
]

module.exports = { bookRideRules, cancelRideRules }
