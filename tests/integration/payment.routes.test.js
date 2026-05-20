const request = require('supertest')
const app = require('../../src/app')
const Ride = require('../../src/models/ride.model')
const User = require('../../src/models/user.model')

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

describe('POST /api/v1/payments', () => {
  it('returns 201 when payment is initiated for a completed ride', async () => {
    const { token, userId } = await registerAndLogin('rider')

    const driverUser = await User.create({
      name: 'Driver', email: `driver_${Date.now()}@t.com`,
      password: 'Test@12345', role: 'driver', authProvider: 'local',
    })

    const ride = await Ride.create({
      riderId: userId,
      driverId: driverUser._id,
      status: 'completed',
      pickup: { address: 'VI', coordinates: [3.4, 6.5] },
      dropoff: { address: 'Lekki', coordinates: [3.45, 6.55] },
      fare: { estimated: 2000, final: 2000 },
      distance: 5,
    })

    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ rideId: ride._id, method: 'cash' })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.payment).toHaveProperty('amount', 2000)
    expect(res.body.data.payment).toHaveProperty('status', 'pending')
  })

  it('returns 400 on duplicate payment', async () => {
    const { token, userId } = await registerAndLogin('rider')

    const driverUser = await User.create({
      name: 'Driver2', email: `driver2_${Date.now()}@t.com`,
      password: 'Test@12345', role: 'driver', authProvider: 'local',
    })

    const ride = await Ride.create({
      riderId: userId,
      driverId: driverUser._id,
      status: 'completed',
      pickup: { address: 'VI', coordinates: [3.4, 6.5] },
      dropoff: { address: 'Lekki', coordinates: [3.45, 6.55] },
      fare: { estimated: 2000, final: 2000 },
      distance: 5,
    })

    await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ rideId: ride._id, method: 'cash' })

    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ rideId: ride._id, method: 'cash' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /api/v1/payments/my', () => {
  it('returns 200 with paginated payments', async () => {
    const { token } = await registerAndLogin('rider')

    const res = await request(app)
      .get('/api/v1/payments/my')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('items')
    expect(res.body.data).toHaveProperty('pagination')
  })
})
