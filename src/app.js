const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const { errorHandler } = require('./middlewares/error.middleware')
const logger = require('./utils/logger')

const app = express()

app.use(cors())
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf } }))
app.use(morgan('dev', { stream: { write: (msg) => logger.http(msg.trim()) } }))

app.use('/api', require('./routes/index'))

try {
  const swaggerUi = require('swagger-ui-express')
  const swaggerSpec = require('../swagger/swagger.config')
  if (swaggerSpec && typeof swaggerSpec === 'object') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  }
} catch (err) { logger.warn('Swagger not loaded: ' + err.message) }

app.use(errorHandler)

module.exports = app
