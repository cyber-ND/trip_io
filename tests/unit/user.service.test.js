jest.mock('../../src/models/user.model')

const User = require('../../src/models/user.model')
const userService = require('../../src/services/user.service')

describe('getProfile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns user when found', async () => {
    User.findById.mockResolvedValue({ _id: 'uid1', name: 'John' })
    const result = await userService.getProfile('uid1')
    expect(result.name).toBe('John')
  })

  it('throws 404 when user not found', async () => {
    User.findById.mockResolvedValue(null)
    await expect(userService.getProfile('uid1')).rejects.toThrow('User not found')
  })
})

describe('updateProfile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns updated user', async () => {
    User.findByIdAndUpdate.mockResolvedValue({ _id: 'uid1', name: 'Updated' })
    const result = await userService.updateProfile('uid1', { name: 'Updated' })
    expect(result.name).toBe('Updated')
  })

  it('throws 404 when user not found', async () => {
    User.findByIdAndUpdate.mockResolvedValue(null)
    await expect(userService.updateProfile('uid1', { name: 'X' })).rejects.toThrow('User not found')
  })
})

describe('deactivateUser', () => {
  beforeEach(() => jest.clearAllMocks())

  it('sets isActive to false', async () => {
    User.findByIdAndUpdate.mockResolvedValue({ _id: 'uid1', isActive: false })
    const result = await userService.deactivateUser('uid1')
    expect(result.isActive).toBe(false)
  })

  it('throws 404 when user not found', async () => {
    User.findByIdAndUpdate.mockResolvedValue(null)
    await expect(userService.deactivateUser('uid1')).rejects.toThrow('User not found')
  })
})
