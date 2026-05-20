jest.mock('../../src/models/driver.model')
jest.mock('../../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }))

const Driver = require('../../src/models/driver.model')
const driverService = require('../../src/services/driver.service')

const mockDriver = (overrides = {}) => ({
  _id: 'did1',
  userId: 'uid1',
  isAvailable: false,
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
})

describe('createDriverProfile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates and returns a driver profile', async () => {
    Driver.findOne.mockResolvedValue(null)
    Driver.create.mockResolvedValue(mockDriver({ isAvailable: false }))

    const result = await driverService.createDriverProfile('uid1', {
      vehicle: { make: 'Toyota', model: 'Camry', year: 2020, plateNumber: 'ABC-123', colour: 'Black' },
      licenseNumber: 'LIC-001',
    })

    expect(Driver.create).toHaveBeenCalled()
    expect(result.userId).toBe('uid1')
  })

  it('throws if profile already exists', async () => {
    Driver.findOne.mockResolvedValue(mockDriver())
    await expect(
      driverService.createDriverProfile('uid1', {})
    ).rejects.toThrow('Driver profile already exists')
  })
})

describe('toggleAvailability', () => {
  beforeEach(() => jest.clearAllMocks())

  it('flips isAvailable from false to true', async () => {
    const driver = mockDriver({ isAvailable: false })
    Driver.findOne.mockResolvedValue(driver)

    const result = await driverService.toggleAvailability('uid1')
    expect(result.isAvailable).toBe(true)
    expect(driver.save).toHaveBeenCalled()
  })

  it('throws if driver profile not found', async () => {
    Driver.findOne.mockResolvedValue(null)
    await expect(driverService.toggleAvailability('uid1')).rejects.toThrow('Driver profile not found')
  })
})

describe('approveDriver', () => {
  beforeEach(() => jest.clearAllMocks())

  it('sets isApproved to true', async () => {
    Driver.findByIdAndUpdate.mockResolvedValue(mockDriver({ isApproved: true }))
    const result = await driverService.approveDriver('did1')
    expect(result.isApproved).toBe(true)
  })

  it('throws if driver not found', async () => {
    Driver.findByIdAndUpdate.mockResolvedValue(null)
    await expect(driverService.approveDriver('did1')).rejects.toThrow('Driver not found')
  })
})

describe('updateDriverLocation', () => {
  beforeEach(() => jest.clearAllMocks())

  it('updates and returns driver with new coordinates', async () => {
    Driver.findOneAndUpdate.mockResolvedValue(mockDriver())
    const result = await driverService.updateDriverLocation('uid1', [3.4, 6.5])
    expect(Driver.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'uid1' },
      { currentLocation: { type: 'Point', coordinates: [3.4, 6.5] } },
      { new: true }
    )
    expect(result).toBeDefined()
  })

  it('throws if driver profile not found', async () => {
    Driver.findOneAndUpdate.mockResolvedValue(null)
    await expect(driverService.updateDriverLocation('uid1', [0, 0])).rejects.toThrow('Driver profile not found')
  })
})
