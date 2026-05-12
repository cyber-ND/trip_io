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

const createCompletedRide = async (riderId, driverId) => {
  return Ride.create({
    riderId,
    driverId,
    status: 'completed',
    pickup: { address: 'VI', coordinates: [3.4, 6.5] },
    dropoff: { address: 'Lekki', coordinates: [3.45, 6.55] },
    fare: { estimated: 2000, final: 2000 },
    distance: 5,
  })
}

describe('POST /api/v1/ratings', () => {
  it('returns 201 when rider rates a completed ride', async () => {
    const { token, userId } = await registerAndLogin('rider')
    const driverUser = await User.create({
      name: 'Driver', email: `drvr_${Date.now()}@t.com`,
      password: 'Test@12345', role: 'driver', authProvider: 'local',
    })
    const ride = await createCompletedRide(userId, driverUser._id)

    const res = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ rideId: ride._id, stars: 5, comment: 'Excellent ride' })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.rating).toHaveProperty('stars', 5)
  })

  it('returns 400 on duplicate rating', async () => {
    const { token, userId } = await registerAndLogin('rider')
    const driverUser = await User.create({
      name: 'Driver2', email: `drvr2_${Date.now()}@t.com`,
      password: 'Test@12345', role: 'driver', authProvider: 'local',
    })
    const ride = await createCompletedRide(userId, driverUser._id)

    await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ rideId: ride._id, stars: 4 })

    const res = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ rideId: ride._id, stars: 3 })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 for stars outside 1-5', async () => {
    const { token } = await registerAndLogin('rider')
    const res = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ rideId: '507f1f77bcf86cd799439011', stars: 6 })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/v1/ratings').send({ rideId: '507f1f77bcf86cd799439011', stars: 3 })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/v1/ratings/driver/:driverId', () => {
  it('returns 200 with paginated driver ratings', async () => {
    const { token, userId } = await registerAndLogin('rider')
    const driverUser = await User.create({
      name: 'Driver3', email: `drvr3_${Date.now()}@t.com`,
      password: 'Test@12345', role: 'driver', authProvider: 'local',
    })
    const ride = await createCompletedRide(userId, driverUser._id)
    await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ rideId: ride._id, stars: 5 })

    const res = await request(app)
      .get(`/api/v1/ratings/driver/${driverUser._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('items')
    expect(res.body.data.items.length).toBeGreaterThan(0)
  })
})
