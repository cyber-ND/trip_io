jest.mock('../../src/models/payment.model')
jest.mock('../../src/models/ride.model')

const Payment = require('../../src/models/payment.model')
const Ride = require('../../src/models/ride.model')
const paymentService = require('../../src/services/payment.service')

const mockRide = (overrides = {}) => ({
  _id: 'ride1',
  status: 'completed',
  riderId: 'user1',
  driverId: 'driver1',
  fare: { final: 2500 },
  ...overrides,
})

describe('initiatePayment', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates a payment for a completed ride', async () => {
    Ride.findById.mockResolvedValue(mockRide())
    Payment.findOne.mockResolvedValue(null)
    Payment.create.mockResolvedValue({ _id: 'pay1', amount: 2500, status: 'pending' })

    const result = await paymentService.initiatePayment({
      rideId: 'ride1',
      riderId: 'user1',
      method: 'cash',
    })

    expect(Payment.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 2500, status: 'pending', driverId: 'driver1' })
    )
    expect(result.amount).toBe(2500)
  })

  it('throws if ride is not completed', async () => {
    Ride.findById.mockResolvedValue(mockRide({ status: 'ongoing' }))

    await expect(
      paymentService.initiatePayment({ rideId: 'ride1', riderId: 'user1' })
    ).rejects.toThrow('Ride is not completed')
  })

  it('throws if payment already exists for this ride', async () => {
    Ride.findById.mockResolvedValue(mockRide())
    Payment.findOne.mockResolvedValue({ _id: 'existing_pay' })

    await expect(
      paymentService.initiatePayment({ rideId: 'ride1', riderId: 'user1' })
    ).rejects.toThrow('Payment already initiated for this ride')
  })

  it('throws if rider does not own the ride', async () => {
    Ride.findById.mockResolvedValue(mockRide({ riderId: 'other_user' }))

    await expect(
      paymentService.initiatePayment({ rideId: 'ride1', riderId: 'user1' })
    ).rejects.toThrow('Not your ride')
  })

  it('throws if no driver is assigned to the ride', async () => {
    Ride.findById.mockResolvedValue(mockRide({ driverId: null }))

    await expect(
      paymentService.initiatePayment({ rideId: 'ride1', riderId: 'user1' })
    ).rejects.toThrow('No driver assigned to this ride')
  })
})
