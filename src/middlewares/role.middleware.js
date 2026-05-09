<<<<<<< HEAD
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
};

module.exports = { allowRoles };
=======
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
>>>>>>> 5bd16010a17c31af57de020611542e78b7985c01
