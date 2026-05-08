const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// Generate Access Token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
};

// Generate Refresh Token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

// Verify Access Token
const verifyToken = (token, isRefresh = false) => {
  try {
    const secret = isRefresh
      ? process.env.JWT_REFRESH_SECRET
      : process.env.JWT_ACCESS_SECRET;

    return jwt.verify(token, secret);
  } catch (err) {
    return null; // important: never throw raw errors to controllers
  }
};

// We can use this to decode without verifying {I hope it's useful to our app though}
const decodeToken = (token) => {
  return jwt.decode(token);
};


module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
};