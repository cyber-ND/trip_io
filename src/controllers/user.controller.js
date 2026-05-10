const userService = require('../services/user.service')
const apiResponse = require('../utils/apiResponse')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id)
  return apiResponse.success(res, 'Profile fetched', { user })
})

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phoneNumber, profilePhoto } = req.body
  const user = await userService.updateProfile(req.user._id, { name, phoneNumber, profilePhoto })
  return apiResponse.success(res, 'Profile updated', { user })
})

const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const result = await userService.getAllUsers({ page, limit })
  return apiResponse.success(res, 'Users fetched', result)
})

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id)
  return apiResponse.success(res, 'User fetched', { user })
})

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.deactivateUser(req.params.id)
  return apiResponse.success(res, 'User deactivated', { user })
})

module.exports = { getProfile, updateProfile, getAllUsers, getUserById, deactivateUser }
