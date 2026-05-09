const apiResponse = require("../utils/apiResponse")

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return apiResponse.error(res, "Forbidden", 403)
    }
    next()
  }
}

module.exports = { allowRoles }
