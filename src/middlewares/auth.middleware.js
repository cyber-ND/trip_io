const jwt = require("jsonwebtoken")
const User = require("../models/user.model")
const apiResponse = require("../utils/apiResponse")
const logger = require("../utils/logger")
const env = require("../config/env")

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiResponse.error(res, "Unauthorized", 401)
  }

  const token = authHeader.split(" ")[1]

  if (!token) {
    return apiResponse.error(res, "Unauthorized", 401)
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user || !user.isActive) {
      return apiResponse.error(res, "Unauthorized", 401)
    }

    req.user = user
    next()
  } catch (error) {
    logger.error("Auth error: " + error.message)
    return apiResponse.error(res, "Unauthorized", 401)
  }
}

module.exports = { protect }
