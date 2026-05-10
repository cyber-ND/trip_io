const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.model");
const Token = require("../models/token.model");
const env = require("../config/env");

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
  if (existing) throw new Error("Email already in use");

  const safeRole = ["rider", "driver"].includes(role) ? role : "rider";
  const user = await User.create({ name, email, password, role: safeRole, phoneNumber });
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);
  await saveRefreshToken(user._id, refreshToken);

  user.password = undefined;
  return { user, accessToken, refreshToken };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || user.authProvider !== "local")
    throw new Error("Invalid credentials");
  if (!user.isActive) throw new Error("Account is deactivated");

  const match = await user.comparePassword(password);
  if (!match) throw new Error("Invalid credentials");

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
  if (!stored) throw new Error("Invalid refresh token");

  const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw new Error("User not found or deactivated");

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

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  refreshAccessToken,
  logoutUser,
};
