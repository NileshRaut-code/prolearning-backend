import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const aigen = asyncHandler(async (req, res) => {
    const genAI = new GoogleGenerativeAI(process.env.APIAI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const { standard, topic,subject,topiclinedid,qno } = req.query;

if (!standard || !topic) {
  throw new ApiError(400, "Standard and topic are required.");
}
// board
const prompt = `Create ${qno} questions related to the academic standard ${standard} ,${subject} and topic ${topic}. The questions should follow this schema: { "question": string, "score": number, "difficultyLevel": string (choose from Easy, Medium, Hard), "topicId": Objectid mongodb( ${topiclinedid}), "tags": array of strings ( like "NEET" ,"JEE" ,"Olympid" etc ,other than tag dont add any tag) }. Ensure the questions vary in difficulty and cover different aspects of the topic.Dont add any other than the question `; 

const result = await model.generateContent(prompt);
const content = result.response.text();


const jsonString = content.replace(/```json|```/g, '');
let questions;

try {
  questions = JSON.parse(jsonString);
} catch (error) {
  throw new ApiError(500, "Failed to parse AI-generated questions.");
}



    return res
      .status(200)
      .json(new ApiResponse(200, questions, "Ai Generated Results"));
  });