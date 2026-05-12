const { body } = require('express-validator')

const rateDriverRules = [
  body('rideId').isMongoId().withMessage('Valid ride ID is required'),
  body('stars')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer between 1 and 5'),
  body('comment').optional().trim().escape(),
]

module.exports = { rateDriverRules }
