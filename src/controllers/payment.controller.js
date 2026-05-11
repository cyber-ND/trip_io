const paymentService = require('../services/payment.service')
const apiResponse = require('../utils/apiResponse')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const initiatePayment = asyncHandler(async (req, res) => {
  const { rideId, method } = req.body
  const payment = await paymentService.initiatePayment({
    rideId,
    riderId: req.user._id,
    method,
  })
  return apiResponse.success(res, 'Payment initiated', { payment }, 201)
})

const getPaymentByRide = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentByRide(req.params.rideId)
  return apiResponse.success(res, 'Payment fetched', { payment })
})

const getMyPayments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const result = await paymentService.getMyPayments(req.user._id, req.user.role, { page, limit })
  return apiResponse.success(res, 'Payments fetched', result)
})

const getAllPayments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const result = await paymentService.getAllPayments({ page, limit })
  return apiResponse.success(res, 'All payments fetched', result)
})

module.exports = { initiatePayment, getPaymentByRide, getMyPayments, getAllPayments }
