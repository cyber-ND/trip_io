const mongoose = require('mongoose')
require('dotenv').config()

const seedAdmin = require('./admin.seeder')
const seedDrivers = require('./driver.seeder')
const seedRiders = require('./rider.seeder')
const seedRides = require('./ride.seeder')

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    await seedAdmin()
    await seedDrivers()
    await seedRiders()
    await seedRides()

    console.log('\nAll seeders completed successfully')
  } catch (err) {
    console.error('Seeder error:', err.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

run()
