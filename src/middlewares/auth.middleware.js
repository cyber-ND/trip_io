<<<<<<< HEAD
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require("../utils/logger");
const env = require("../config/env");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Auth error: " + error.message);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

module.exports = { protect };
=======
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
>>>>>>> 5bd16010a17c31af57de020611542e78b7985c01
