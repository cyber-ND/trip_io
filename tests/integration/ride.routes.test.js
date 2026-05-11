const request = require('supertest')
const app = require('../../src/app')

const registerAndLogin = async (role = 'rider') => {
  const email = `${role}_${Date.now()}@test.com`
  const res = await request(app).post('/api/auth/register').send({
    name: `Test ${role}`,
    email,
    password: 'Test@12345',
    role,
  })
  return res.body.data.accessToken
}

describe('POST /api/rides', () => {
  it('returns 201 when a rider books a ride', async () => {
    const token = await registerAndLogin('rider')

    const res = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pickup: { address: 'Victoria Island', coordinates: [3.4, 6.5] },
        dropoff: { address: 'Lekki', coordinates: [3.45, 6.55] },
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.ride).toHaveProperty('status', 'pending')
  })

  it('returns 403 when a driver tries to book a ride', async () => {
    const token = await registerAndLogin('driver')

    const res = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pickup: { address: 'Victoria Island', coordinates: [3.4, 6.5] },
        dropoff: { address: 'Lekki', coordinates: [3.45, 6.55] },
      })

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/rides').send({
      pickup: { address: 'Victoria Island', coordinates: [3.4, 6.5] },
      dropoff: { address: 'Lekki', coordinates: [3.45, 6.55] },
    })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/rides/my', () => {
  it('returns paginated rides for the authenticated user', async () => {
    const token = await registerAndLogin('rider')

    const res = await request(app)
      .get('/api/rides/my')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('items')
    expect(res.body.data).toHaveProperty('pagination')
  })
})
