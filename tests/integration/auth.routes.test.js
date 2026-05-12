const request = require('supertest')
const app = require('../../src/app')

describe('POST /api/v1/auth/register', () => {
  it('returns 201 and tokens on valid registration', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@12345',
    })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('accessToken')
    expect(res.body.data).toHaveProperty('refreshToken')
    expect(res.body.data.user).not.toHaveProperty('password')
  })

  it('returns 400 on duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'First User',
      email: 'dup@example.com',
      password: 'Test@12345',
    })

    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Second User',
      email: 'dup@example.com',
      password: 'Test@12345',
    })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Login User',
      email: 'login@test.com',
      password: 'Login@12345',
    })
  })

  it('returns 200 and tokens on valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'login@test.com',
      password: 'Login@12345',
    })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('accessToken')
  })

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'login@test.com',
      password: 'WrongPassword',
    })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})
