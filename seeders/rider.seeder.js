const bcrypt = require('bcryptjs')
const { faker } = require('@faker-js/faker')
const User = require('../src/models/user.model')

const seedRiders = async () => {
  await User.deleteMany({ role: 'rider' })

  const hashed = await bcrypt.hash('Rider@12345', 10)
  const emails = []

  for (let i = 0; i < 20; i++) {
    const user = await User.create({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: hashed,
      role: 'rider',
      phoneNumber: `+234${faker.string.numeric(10)}`,
      authProvider: 'local',
    })
    emails.push(user.email)
  }

  console.log('20 riders seeded')
  emails.forEach((e) => console.log(`  ${e}`))
}

module.exports = seedRiders
