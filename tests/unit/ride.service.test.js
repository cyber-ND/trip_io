jest.mock('../../src/models/ride.model')
jest.mock('../../src/models/driver.model')
jest.mock('../../src/utils/distance')

const Ride = require('../../src/models/ride.model')
const Driver = require('../../src/models/driver.model')
const { calculateDistance } = require('../../src/utils/distance')
const rideService = require('../../src/services/ride.service')

const mockRide = (overrides = {}) => ({
  _id: 'ride1',
  riderId: 'user1',
  driverId: 'driver1',
  status: 'pending',
  pickup: { address: 'Victoria Island', coordinates: [3.4, 6.5] },
  fare: { estimated: 1000 },
  rejectionCount: 0,
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
})

describe('bookRide', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates a ride and attempts driver assignment', async () => {
    calculateDistance.mockReturnValue(5)
    const ride = mockRide()
    Ride.create.mockResolvedValue(ride)
    Driver.findOne.mockResolvedValue(null)

    const result = await rideService.bookRide({
      riderId: 'user1',
      pickup: { address: 'Victoria Island', coordinates: [3.4, 6.5] },
      dropoff: { address: 'Lekki', coordinates: [3.45, 6.55] },
    })

    expect(Ride.create).toHaveBeenCalled()
    expect(result.status).toBe('pending')
  })
})

describe('acceptRide', () => {
  beforeEach(() => jest.clearAllMocks())

  it('sets ride status to accepted', async () => {
    const ride = mockRide()
    Ride.findById.mockResolvedValue(ride)

    const result = await rideService.acceptRide('ride1', 'driver1')
    expect(result.status).toBe('accepted')
  })

  it('throws if ride is not pending', async () => {
    Ride.findById.mockResolvedValue(mockRide({ status: 'ongoing' }))

    await expect(rideService.acceptRide('ride1', 'driver1')).rejects.toThrow('Ride is not pending')
  })

  it('throws if driver is not assigned to this ride', async () => {
    Ride.findById.mockResolvedValue(mockRide({ driverId: 'other_driver' }))

    await expect(rideService.acceptRide('ride1', 'driver1')).rejects.toThrow('Not assigned to this driver')
  })
})

describe('cancelRide', () => {
  beforeEach(() => jest.clearAllMocks())

  it('cancels a pending ride', async () => {
    const ride = mockRide({ status: 'pending', riderId: 'user1' })
    Ride.findById.mockResolvedValue(ride)

    const result = await rideService.cancelRide('ride1', 'user1', 'Changed my mind')
    expect(result.status).toBe('cancelled')
    expect(result.cancelReason).toBe('Changed my mind')
  })

  it('throws if ride is ongoing', async () => {
    Ride.findById.mockResolvedValue(mockRide({ status: 'ongoing', riderId: 'user1' }))

    await expect(rideService.cancelRide('ride1', 'user1')).rejects.toThrow(
      'Ride cannot be cancelled at this stage'
    )
  })

  it('throws if rider does not own the ride', async () => {
    Ride.findById.mockResolvedValue(mockRide({ status: 'pending', riderId: 'other_user' }))

    await expect(rideService.cancelRide('ride1', 'user1')).rejects.toThrow('Not your ride')
  })
})
