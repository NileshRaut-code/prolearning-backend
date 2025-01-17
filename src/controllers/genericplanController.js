import { GenericLearningPlan } from "../models/GenricMode.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
export const plangenerate = asyncHandler(
    async(req,res)=>{
        const {standard}=req.params;
        if (!standard || isNaN(standard)) {
            return res.status(400).json({ error: "Invalid or missing standard parameter." });
          }
      
          const learningPlan = await GenericLearningPlan.findOne({ standard });
      
          if (!learningPlan) {
            return res.status(404).json({ message: `No generic learning plan found for standard ${standard}` });
          }

          return res.status(200).json(new ApiResponse(200, learningPlan, "Generic plan Success"));
      
    }
)