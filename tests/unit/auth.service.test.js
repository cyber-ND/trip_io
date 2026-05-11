jest.mock('../../src/models/user.model')
jest.mock('../../src/models/token.model')

const User = require('../../src/models/user.model')
const Token = require('../../src/models/token.model')
const authService = require('../../src/services/auth.service')

describe('registerUser', () => {
  beforeEach(() => jest.clearAllMocks())

  it('registers a user and returns access and refresh tokens', async () => {
    User.findOne.mockResolvedValue(null)
    User.create.mockResolvedValue({ _id: 'uid1', role: 'rider' })
    Token.create.mockResolvedValue({})

    const result = await authService.registerUser({
      name: 'John Doe',
      email: 'john@test.com',
      password: 'Pass@1234',
    })

    expect(result).toHaveProperty('accessToken')
    expect(result).toHaveProperty('refreshToken')
    expect(result.user.password).toBeUndefined()
  })

  it('throws if email is already in use', async () => {
    User.findOne.mockResolvedValue({ email: 'john@test.com' })

    await expect(
      authService.registerUser({ name: 'John', email: 'john@test.com', password: 'Pass@1234' })
    ).rejects.toThrow('Email already in use')
  })

  it('defaults role to rider when admin is passed', async () => {
    User.findOne.mockResolvedValue(null)
    let capturedRole
    User.create.mockImplementation((data) => {
      capturedRole = data.role
      return Promise.resolve({ _id: 'uid1', role: data.role })
    })
    Token.create.mockResolvedValue({})

    await authService.registerUser({ name: 'John', email: 'j@t.com', password: 'Pass@1234', role: 'admin' })
    expect(capturedRole).toBe('rider')
  })
})

describe('loginUser', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns tokens on valid credentials', async () => {
    const mockUser = {
      _id: 'uid1',
      role: 'rider',
      authProvider: 'local',
      isActive: true,
      comparePassword: jest.fn().mockResolvedValue(true),
    }
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) })
    Token.create.mockResolvedValue({})

    const result = await authService.loginUser({ email: 'j@t.com', password: 'Pass@1234' })

    expect(result).toHaveProperty('accessToken')
    expect(result.user.password).toBeUndefined()
  })

  it('throws on wrong password', async () => {
    const mockUser = {
      _id: 'uid1',
      authProvider: 'local',
      isActive: true,
      comparePassword: jest.fn().mockResolvedValue(false),
    }
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) })

    await expect(
      authService.loginUser({ email: 'j@t.com', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials')
  })

  it('throws if user does not exist', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) })

    await expect(
      authService.loginUser({ email: 'no@one.com', password: 'pass' })
    ).rejects.toThrow('Invalid credentials')
  })
})
