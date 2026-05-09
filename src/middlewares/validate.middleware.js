<<<<<<< HEAD
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
=======
const { validationResult } = require("express-validator")
const apiResponse = require("../utils/apiResponse")

const validate = (req, res, next) => {
  const errors = validationResult(req)
>>>>>>> 5bd16010a17c31af57de020611542e78b7985c01

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
<<<<<<< HEAD
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = { validate };
=======
    }))
    return apiResponse.error(res, "Validation failed", 400, formattedErrors)
  }

  next()
}

module.exports = { validate }
>>>>>>> 5bd16010a17c31af57de020611542e78b7985c01
