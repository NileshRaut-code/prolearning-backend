import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/userModel.js";

// Get all users excluding sensitive fields
export const getAllUsersForSuperadmin = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken");
  res.status(200).json(users);
});

// Change a user's role
export const changeUserRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) {
    throw new ApiError(400, "UserId and role are required");
  }
  const validRoles = ["TEACHER", "STUDENT", "PARENT", "SUPERADMIN"];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  user.role = role;
  await user.save();
  res.status(200).json({
    message: "User role updated successfully",
    user: user.toObject({ getters: true, versionKey: false })
  });
});

// Delete a user
export const deleteUserBySuperadmin = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    throw new ApiError(400, "UserId is required");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  await user.remove();
  res.status(200).json({ message: "User deleted successfully" });
});
