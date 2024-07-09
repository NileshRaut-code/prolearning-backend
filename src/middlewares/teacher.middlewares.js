import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const verifyTeacher = asyncHandler(async(req, _, next) => {
    try {
      const user = req.user;
     
      if (!user || user.role !== "TEACHER") {
        throw new ApiError(403, "Forbidden : TEACHER access required");
      }
      console.log("Valideted as the Teacher succesfully");
      next();
    } catch (error) {
      throw new ApiError(403, error?.message || "Forbidden");
    }
  });