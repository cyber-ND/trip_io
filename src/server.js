const app = require('./app')
const connectDB = require('./config/db')
const env = require('./config/env')
const logger = require('./utils/logger')

const start = async () => {
  await connectDB()
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`)
  })
}

start()

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`)
  process.exit(1)
})
