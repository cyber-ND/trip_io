const authService = require('../services/auth.service')
const apiResponse = require('../utils/apiResponse')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phoneNumber } = req.body
  const result = await authService.registerUser({ name, email, password, role, phoneNumber })
  return apiResponse.success(res, 'Registration successful', result, 201)
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const result = await authService.loginUser({ email, password })
  return apiResponse.success(res, 'Login successful', result)
})

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body
  const result = await authService.googleLogin(idToken)
  return apiResponse.success(res, 'Google login successful', result)
})

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  const result = await authService.refreshAccessToken(refreshToken)
  return apiResponse.success(res, 'Token refreshed', result)
})

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  await authService.logoutUser(refreshToken)
  return apiResponse.success(res, 'Logout successful')
})

module.exports = { register, login, googleLogin, refreshToken, logout }
