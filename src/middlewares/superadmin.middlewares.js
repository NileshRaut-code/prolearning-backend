import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifySuperadmin = asyncHandler((req, res, next) => {
  const user = req.user;
  if (!user || user.role !== "SUPERADMIN") {
    throw new ApiError(403, "Forbidden: SUPERADMIN access required");
  }
  next();
});
