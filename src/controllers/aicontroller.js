import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const aigen = asyncHandler(async (req, res) => {
    const genAI = new GoogleGenerativeAI(process.env.APIAI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
 
const prompt = "list of 10 question from 10th cbsc ,math , matrix ?";
 
const result = await model.generateContent(prompt);
console.log(result.response.text());
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Ai Generated Results"));
  });