const { body } = require('express-validator')

const updateProfileRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phoneNumber')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Invalid phone number'),
  body('profilePhoto').optional().isURL().withMessage('Profile photo must be a valid URL'),
]

module.exports = { updateProfileRules }
