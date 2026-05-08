const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");
const Token = require("../models/token.model");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const crypto = require("crypto");

// User Registration
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new Error("Email already exists");
  }

  const user = await User.create({ name, email, password, role });

  const verificationToken = crypto.randomBytes(32).toString("hex");
  await Token.create({
    token: verificationToken,
    user: user._id,
    type: "verifyEmail",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // Send Verification email

  res.status(StatusCodes.CREATED).json({
    msg: "User registered successfully. Please check your email to verify your account.",
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw new Error("Please verify your email first");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

  await Token.create({
    token: refreshToken,
    user: user._id,
    type: "refresh",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.status(StatusCodes.OK).json({
    msg: "Login successful",
    accessToken,
    refreshToken,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }
  const token = await Token.findOne({ token: refreshToken, type: "refresh" });
  if (!token) {
    throw new Error("Invalid refresh token");
  }

  token.blacklisted = true;
  await token.save();

  res.status(StatusCodes.OK).json({
    msg: "Logout successful",
  });
};

const verifyEmail = async (req, res) => {
  const { token, email } = req.body;
  if (!token || !email) {
    throw new Error("Email is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email");
  }

  const verificationToken = await Token.findOne({
    token,
    user: user._id,
    type: "verifyEmail",
  });
  if (!verificationToken || verificationToken.expires < Date.now()) {
    throw new Error("token is invalid or expired");
  }

  user.isEmailVerified = true;
  await user.save();
  await verificationToken.deleteOne();
  res.status(StatusCodes.OK).json({
    msg: "Email verified successfully",
  });
};

const forgotPassword = async (req, res) => {
  res.send("forgot Password");
};

const resetPassword = async (req, res) => {
  res.send("reset password");
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
