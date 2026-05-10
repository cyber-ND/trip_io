const driverService = require('../services/driver.service')
const apiResponse = require('../utils/apiResponse')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const createDriverProfile = asyncHandler(async (req, res) => {
  const driver = await driverService.createDriverProfile(req.user._id, req.body)
  return apiResponse.success(res, 'Driver profile created', { driver }, 201)
})

const getDriverProfile = asyncHandler(async (req, res) => {
  const driver = await driverService.getDriverByUserId(req.user._id)
  return apiResponse.success(res, 'Driver profile fetched', { driver })
})

const toggleAvailability = asyncHandler(async (req, res) => {
  const driver = await driverService.toggleAvailability(req.user._id)
  return apiResponse.success(res, 'Availability updated', { driver })
})

const updateDriverLocation = asyncHandler(async (req, res) => {
  const { coordinates } = req.body
  const driver = await driverService.updateDriverLocation(req.user._id, coordinates)
  return apiResponse.success(res, 'Location updated', { driver })
})

const getAllDrivers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const result = await driverService.getAllDrivers({ page, limit })
  return apiResponse.success(res, 'Drivers fetched', result)
})

const approveDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.approveDriver(req.params.id)
  return apiResponse.success(res, 'Driver approved', { driver })
})

module.exports = {
  createDriverProfile,
  getDriverProfile,
  toggleAvailability,
  updateDriverLocation,
  getAllDrivers,
  approveDriver,
}
