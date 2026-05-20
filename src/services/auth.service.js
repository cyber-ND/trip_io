const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.model");
const Token = require("../models/token.model");
const env = require("../config/env");
const { AppError } = require("../middlewares/error.middleware");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email");

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
};

const saveRefreshToken = async (userId, refreshToken) => {
  const { exp } = jwt.decode(refreshToken);
  await Token.create({
    userId,
    token: refreshToken,
    expiresAt: new Date(exp * 1000),
  });
};

const registerUser = async ({ name, email, password, role, phoneNumber }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError("Email already in use", 400);

  const safeRole = ["rider", "driver"].includes(role) ? role : "rider";

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    phoneNumber,
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);
  await saveRefreshToken(user._id, refreshToken);

  sendVerificationEmail(user.email, verificationToken).catch(() => {});

  user.password = undefined;
  return { user, accessToken, refreshToken };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || user.authProvider !== "local")
    throw new AppError("Invalid credentials", 401);
  if (!user.isActive) throw new AppError("Account is deactivated", 403);

  const match = await user.comparePassword(password);
  if (!match) throw new AppError("Invalid credentials", 401);

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);
  await saveRefreshToken(user._id, refreshToken);

  user.password = undefined;
  return { user, accessToken, refreshToken };
};

const googleLogin = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const { sub: googleId, email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ googleId }).select("+googleId");
  if (!user) {
    user = await User.findOne({ email });
    if (user) {
      user.googleId = googleId;
      user.authProvider = "google";
      if (picture && !user.profilePhoto) user.profilePhoto = picture;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        profilePhoto: picture || "",
      });
    }
  }

  if (!user.isActive) throw new Error("Account is deactivated");

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);
  await saveRefreshToken(user._id, refreshToken);

  user.googleId = undefined;
  return { user, accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken) => {
  const stored = await Token.findOne({ token: refreshToken });
  if (!stored) throw new AppError("Invalid refresh token", 401);

  const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw new AppError("User not found or deactivated", 401);

  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
  );

  return { accessToken };
};

const logoutUser = async (refreshToken) => {
  await Token.findOneAndDelete({ token: refreshToken });
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("No account with that email", 404);
  if (user.authProvider !== "local")
    throw new AppError("This account uses Google login", 400);

  const token = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  await sendPasswordResetEmail(user.email, token);

  user.resetPasswordToken = hashed;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
};

const resetPassword = async (token, newPassword) => {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");
  if (!user) throw new AppError("Invalid or expired reset token", 400);

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};

const verifyEmail = async (token) => {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpires");
  if (!user) throw new AppError("Invalid or expired verification token", 400);

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
};

const resendVerification = async (email) => {
  const user = await User.findOne({ email }).select("+emailVerificationToken +emailVerificationExpires");
  if (!user) throw new AppError("No account with that email", 404);
  if (user.isEmailVerified) throw new AppError("Email is already verified", 400);

  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail(user.email, token);
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
