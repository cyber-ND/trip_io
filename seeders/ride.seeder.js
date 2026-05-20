const { faker } = require('@faker-js/faker')
const User = require('../src/models/user.model')
const Driver = require('../src/models/driver.model')
const Ride = require('../src/models/ride.model')
const Payment = require('../src/models/payment.model')
const Rating = require('../src/models/rating.model')

const lagosAreas = [
  'Victoria Island, Lagos',
  'Lekki Phase 1, Lagos',
  'Ikeja, Lagos',
  'Surulere, Lagos',
  'Yaba, Lagos',
  'Ajah, Lagos',
  'Ikorodu, Lagos',
  'Apapa, Lagos',
  'Gbagada, Lagos',
  'Magodo, Lagos',
]

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const seedRides = async () => {
  await Rating.deleteMany({})
  await Payment.deleteMany({})
  await Ride.deleteMany({})

  const riders = await User.find({ role: 'rider' })
  const drivers = await Driver.find({ isApproved: true })

  if (!riders.length || !drivers.length) {
    throw new Error('Run rider and driver seeders first')
  }

  for (let i = 0; i < 15; i++) {
    const rider = pick(riders)
    const driver = pick(drivers)

    const fare = Math.floor(Math.random() * 4500 + 500)
    const distance = parseFloat((Math.random() * 20 + 1).toFixed(2))
    const completedAt = faker.date.between({ from: '2025-01-01', to: '2025-12-31' })
    const startedAt = new Date(completedAt.getTime() - Math.floor(Math.random() * 30 * 60 * 1000))

    const ride = await Ride.create({
      riderId: rider._id,
      driverId: driver.userId,
      status: 'completed',
      pickup: {
        address: pick(lagosAreas),
        coordinates: [parseFloat((Math.random() * 0.2 + 3.3).toFixed(6)), parseFloat((Math.random() * 0.2 + 6.4).toFixed(6))],
      },
      dropoff: {
        address: pick(lagosAreas),
        coordinates: [parseFloat((Math.random() * 0.2 + 3.3).toFixed(6)), parseFloat((Math.random() * 0.2 + 6.4).toFixed(6))],
      },
      fare: { estimated: fare, final: fare },
      distance,
      startedAt,
      completedAt,
    })

    await Payment.create({
      rideId: ride._id,
      riderId: rider._id,
      driverId: driver.userId,
      amount: fare,
      method: pick(['cash', 'card', 'wallet']),
      status: 'completed',
      paidAt: completedAt,
    })

    await Rating.create({
      rideId: ride._id,
      riderId: rider._id,
      driverId: driver.userId,
      stars: Math.floor(Math.random() * 3) + 3,
      comment: faker.lorem.sentence(),
    })
  }

  console.log('15 completed rides seeded with payments and ratings')
}

module.exports = seedRides
