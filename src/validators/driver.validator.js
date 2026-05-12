const { body } = require('express-validator')

const createProfileRules = [
  body('vehicle.make').trim().notEmpty().withMessage('Vehicle make is required'),
  body('vehicle.model').trim().notEmpty().withMessage('Vehicle model is required'),
  body('vehicle.year')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('Valid vehicle year is required'),
  body('vehicle.plateNumber').trim().notEmpty().withMessage('Plate number is required'),
  body('vehicle.colour').trim().notEmpty().withMessage('Vehicle colour is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
]

const updateLocationRules = [
  body('coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [longitude, latitude]')
    .custom((val) => val.every((v) => typeof v === 'number'))
    .withMessage('Coordinates must be numbers'),
]

module.exports = { createProfileRules, updateLocationRules }
