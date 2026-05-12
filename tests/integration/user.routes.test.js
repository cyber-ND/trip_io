const request = require('supertest')
const app = require('../../src/app')

const registerAndLogin = async (role = 'rider') => {
  const email = `${role}_${Date.now()}@test.com`
  const res = await request(app).post('/api/v1/auth/register').send({
    name: `Test ${role}`,
    email,
    password: 'Test@12345',
    role,
  })
  return { token: res.body.data.accessToken, userId: res.body.data.user._id }
}

describe('GET /api/v1/users/me', () => {
  it('returns 200 and user profile', async () => {
    const { token } = await registerAndLogin()
    const res = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user).toHaveProperty('email')
    expect(res.body.data.user).not.toHaveProperty('password')
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/users/me')
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/v1/users/me', () => {
  it('returns 200 and updated name', async () => {
    const { token } = await registerAndLogin()
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user.name).toBe('Updated Name')
  })

  it('returns 400 for invalid profilePhoto URL', async () => {
    const { token } = await registerAndLogin()
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ profilePhoto: 'not-a-url' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 for empty name string', async () => {
    const { token } = await registerAndLogin()
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '   ' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})
