const User = require("../models/user.model");
const { AppError } = require("../middlewares/error.middleware");

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

const updateProfile = async (userId, { name, phoneNumber, profilePhoto }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { name, phoneNumber, profilePhoto },
    { new: true, runValidators: true },
  );
  if (!user) throw new AppError("User not found", 404);
  return user;
};

const getAllUsers = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(),
  ]);
  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true },
  );
  if (!user) throw new AppError("User not found", 404);
  return user;
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  deactivateUser,
};
