import { Topic } from "../models/topicModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Review } from "../models/reviewModel.js";
export const searchTopics = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Search query is required." });
  }

  try {
    // Perform a text search on the 'name' field in the Topic model
    const results = await Topic.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
    const resultscomment = await Review.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } });
  
    return res
      .status(200)
      .json(new ApiResponse(200, {results,resultscomment}, "Search results retrieved successfully"));
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve search results." });
  }
});
