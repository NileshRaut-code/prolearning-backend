import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Question } from "../models/questionModel.js";
import { Topic } from "../models/topicModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createQuestion = asyncHandler(async (req, res) => {
  const { questionText, topicId, options, correctAnswer, difficultyLevel, score, explanation, tags } = req.body;

  if (!questionText || !options || !correctAnswer) {
    throw new ApiError(400, "Question text, options, and correct answer are required");
  }

  let topic = null;
  if (topicId) {
    topic = await Topic.findById(topicId);
    if (!topic) {
      throw new ApiError(404, "Topic not found");
    }
  }

  const question = await Question.create({ 
    questionText, 
    topic: topicId, 
    topicId,
    options, 
    correctAnswer,
    difficultyLevel: difficultyLevel || "Medium",
    score: score || 1,
    explanation,
    tags: tags || []
  });
  
  const questionid=question._id

  if (topic && !topic.questions.includes(questionid)) {
    topic.questions.push(questionid);
    await topic.save();
  }


  return res
    .status(201)
    .json(new ApiResponse(201, question, "Question created successfully"));
});

const getAllQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find({}).populate('topic');

  return res
    .status(200)
    .json(new ApiResponse(200, questions, "Questions fetched successfully"));
});

const getQuestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await Question.findById(id).populate('topic');

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, question, "Question fetched successfully"));
});

const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { questionText, topicId, options, correctAnswer, difficultyLevel, score, explanation, tags } = req.body;

  const question = await Question.findById(id);

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  if (topicId) {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      throw new ApiError(404, "Topic not found");
    }
    question.topic = topicId;
    question.topicId = topicId;
  }

  question.questionText = questionText || question.questionText;
  question.options = options || question.options;
  question.correctAnswer = correctAnswer || question.correctAnswer;
  question.difficultyLevel = difficultyLevel || question.difficultyLevel;
  question.score = score !== undefined ? score : question.score;
  question.explanation = explanation !== undefined ? explanation : question.explanation;
  question.tags = tags || question.tags;

  const updatedQuestion = await question.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedQuestion, "Question updated successfully"));
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await Question.findById(id);

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  await question.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Question deleted successfully"));
});

export {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
