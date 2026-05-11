const bcrypt = require('bcryptjs')
const User = require('../src/models/user.model')

const seedAdmin = async () => {
  await User.deleteMany({ role: 'admin' })

  const hashed = await bcrypt.hash('Admin@12345', 10)
  await User.create({
    name: 'Trip IO Admin',
    email: 'admin@tripio.com',
    password: hashed,
    role: 'admin',
    authProvider: 'local',
  })

  console.log('Admin seeded')
  console.log('  Email:    admin@tripio.com')
  console.log('  Password: Admin@12345')
}

module.exports = seedAdmin
