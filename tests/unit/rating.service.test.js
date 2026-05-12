jest.mock('../../src/models/rating.model')
jest.mock('../../src/models/ride.model')

const Rating = require('../../src/models/rating.model')
const Ride = require('../../src/models/ride.model')
const ratingService = require('../../src/services/rating.service')

const mockRide = (overrides = {}) => ({
  _id: 'ride1',
  riderId: 'user1',
  driverId: 'driver1',
  status: 'completed',
  ...overrides,
})

describe('rateDriver', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates and returns a rating', async () => {
    Ride.findById.mockResolvedValue(mockRide())
    Rating.findOne.mockResolvedValue(null)
    Rating.create.mockResolvedValue({ _id: 'rat1', stars: 5, comment: 'Great' })

    const result = await ratingService.rateDriver({ rideId: 'ride1', riderId: 'user1', stars: 5, comment: 'Great' })
    expect(Rating.create).toHaveBeenCalledWith(expect.objectContaining({ stars: 5, driverId: 'driver1' }))
    expect(result.stars).toBe(5)
  })

  it('throws if ride not found', async () => {
    Ride.findById.mockResolvedValue(null)
    await expect(ratingService.rateDriver({ rideId: 'ride1', riderId: 'user1', stars: 4 })).rejects.toThrow('Ride not found')
  })

  it('throws if ride is not completed', async () => {
    Ride.findById.mockResolvedValue(mockRide({ status: 'ongoing' }))
    await expect(ratingService.rateDriver({ rideId: 'ride1', riderId: 'user1', stars: 4 })).rejects.toThrow('Can only rate a completed ride')
  })

  it('throws if rider does not own the ride', async () => {
    Ride.findById.mockResolvedValue(mockRide({ riderId: 'other_user' }))
    await expect(ratingService.rateDriver({ rideId: 'ride1', riderId: 'user1', stars: 4 })).rejects.toThrow('Not your ride')
  })

  it('throws if ride was already rated', async () => {
    Ride.findById.mockResolvedValue(mockRide())
    Rating.findOne.mockResolvedValue({ _id: 'existing' })
    await expect(ratingService.rateDriver({ rideId: 'ride1', riderId: 'user1', stars: 3 })).rejects.toThrow('Ride has already been rated')
  })

  it('throws if no driver assigned', async () => {
    Ride.findById.mockResolvedValue(mockRide({ driverId: null }))
    await expect(ratingService.rateDriver({ rideId: 'ride1', riderId: 'user1', stars: 4 })).rejects.toThrow('No driver assigned to this ride')
  })
})
