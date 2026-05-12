const bcrypt = require('bcryptjs')
const { faker } = require('@faker-js/faker')
const User = require('../src/models/user.model')
const Driver = require('../src/models/driver.model')

const seedDrivers = async () => {
  await Driver.deleteMany({})
  await User.deleteMany({ role: 'driver' })

  const hashed = await bcrypt.hash('Driver@12345', 10)
  const emails = []

  for (let i = 0; i < 10; i++) {
    const user = await User.create({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: hashed,
      role: 'driver',
      phoneNumber: `+234${faker.string.numeric(10)}`,
      authProvider: 'local',
    })

    await Driver.create({
      userId: user._id,
      vehicle: {
        make: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: 2015 + Math.floor(Math.random() * 9),
        plateNumber: faker.string.alphanumeric(7).toUpperCase(),
        colour: faker.color.human(),
      },
      licenseNumber: faker.string.alphanumeric(10).toUpperCase(),
      isApproved: true,
      isAvailable: true,
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      totalRatings: faker.number.int({ min: 5, max: 50 }),
      currentLocation: {
        type: 'Point',
        coordinates: [
          parseFloat((Math.random() * 0.2 + 3.3).toFixed(6)),
          parseFloat((Math.random() * 0.2 + 6.4).toFixed(6)),
        ],
      },
    })

    emails.push(user.email)
  }

  console.log('10 drivers seeded')
  emails.forEach((e) => console.log(`  ${e}`))
}

module.exports = seedDrivers
