process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = 'test_access_secret_trip_io'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_trip_io'
process.env.JWT_ACCESS_EXPIRES_IN = '15m'
process.env.JWT_REFRESH_EXPIRES_IN = '7d'
process.env.GOOGLE_CLIENT_ID = 'test_google_client_id'
process.env.PAYSTACK_SECRET_KEY = 'test_paystack_key'

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongo

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
  await Promise.all(Object.values(mongoose.models).map((m) => m.createIndexes()))
})

afterEach(async () => {
  for (const key in mongoose.connection.collections) {
    await mongoose.connection.collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongo.stop()
})
