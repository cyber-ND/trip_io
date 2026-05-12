const request = require('supertest')
const app = require('../../src/app')

const registerAndLogin = async (role = 'driver') => {
  const email = `${role}_${Date.now()}@test.com`
  const res = await request(app).post('/api/v1/auth/register').send({
    name: `Test ${role}`,
    email,
    password: 'Test@12345',
    role,
  })
  return { token: res.body.data.accessToken, userId: res.body.data.user._id }
}

const driverPayload = {
  vehicle: { make: 'Toyota', model: 'Camry', year: 2020, plateNumber: 'ABC-123D', colour: 'Black' },
  licenseNumber: 'LIC-001D',
}

describe('POST /api/v1/drivers/profile', () => {
  it('returns 201 when driver creates profile', async () => {
    const { token } = await registerAndLogin('driver')
    const res = await request(app)
      .post('/api/v1/drivers/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(driverPayload)
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.driver).toHaveProperty('licenseNumber', 'LIC-001D')
  })

  it('returns 400 on duplicate profile creation', async () => {
    const { token } = await registerAndLogin('driver')
    await request(app).post('/api/v1/drivers/profile').set('Authorization', `Bearer ${token}`).send(driverPayload)
    const res = await request(app).post('/api/v1/drivers/profile').set('Authorization', `Bearer ${token}`).send(driverPayload)
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 403 when a rider tries to create driver profile', async () => {
    const { token } = await registerAndLogin('rider')
    const res = await request(app)
      .post('/api/v1/drivers/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(driverPayload)
    expect(res.status).toBe(403)
  })
})

describe('GET /api/v1/drivers/profile', () => {
  it('returns 200 with driver profile', async () => {
    const { token } = await registerAndLogin('driver')
    await request(app).post('/api/v1/drivers/profile').set('Authorization', `Bearer ${token}`).send(driverPayload)
    const res = await request(app).get('/api/v1/drivers/profile').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.driver).toHaveProperty('licenseNumber')
  })

  it('returns 404 if driver has no profile', async () => {
    const { token } = await registerAndLogin('driver')
    const res = await request(app).get('/api/v1/drivers/profile').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/v1/drivers/availability', () => {
  it('returns 200 and toggles availability', async () => {
    const { token } = await registerAndLogin('driver')
    await request(app).post('/api/v1/drivers/profile').set('Authorization', `Bearer ${token}`).send(driverPayload)
    const res = await request(app).patch('/api/v1/drivers/availability').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
