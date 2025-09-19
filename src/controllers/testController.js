import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Test } from "../models/testModel.js";
import { Question } from "../models/questionModel.js";
import { User } from "../models/userModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTest = asyncHandler(async (req, res) => {
  const { name, questions, timeLimit, instructions, topic } = req.body;
  const createdBy = req.user._id;
  
  if (!name || !questions || !createdBy) {
    throw new ApiError(400, "Name, questions, and creator are required");
  }

  const user = await User.findById(createdBy);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const test = await Test.create({ 
    name, 
    questions, 
    createdBy,
    timeLimit: timeLimit || 60,
    instructions,
    topic
  });

  return res
    .status(201)
    .json(new ApiResponse(201, test, "Test created successfully"));
});

const getAllTests = asyncHandler(async (req, res) => {
  const tests = await Test.find({})
    .populate('questions')
    .populate('createdBy', 'fullName username');

  return res
    .status(200)
    .json(new ApiResponse(200, tests, "Tests fetched successfully"));
});

const getTestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const test = await Test.findById(id)
    .populate('questions')
    .populate('createdBy', 'fullName username');

  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, test, "Test fetched successfully"));
});

const updateTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, questions, timeLimit, instructions, topic } = req.body;

  const test = await Test.findById(id);

  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  test.name = name || test.name;
  test.questions = questions || test.questions;
  test.timeLimit = timeLimit !== undefined ? timeLimit : test.timeLimit;
  test.instructions = instructions !== undefined ? instructions : test.instructions;
  test.topic = topic || test.topic;

  const updatedTest = await test.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTest, "Test updated successfully"));
});

const deleteTest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const test = await Test.findById(id);

  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  await test.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Test deleted successfully"));
});

const submitTestResult = asyncHandler(async (req, res) => {
  const { id } = req.params; // test ID
  const { answers, timeSpent } = req.body;
  const studentId = req.user._id;

  if (!answers || !Array.isArray(answers)) {
    throw new ApiError(400, "Answers are required and must be an array");
  }

  const test = await Test.findById(id).populate('questions');
  
  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  // Calculate score
  let totalScore = 0;
  let correctAnswers = 0;
  const detailedResults = [];

  for (const answer of answers) {
    const question = await Question.findById(answer.questionId);
    if (question) {
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) {
        totalScore += question.score || 1;
        correctAnswers++;
      }
      
      detailedResults.push({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        score: isCorrect ? (question.score || 1) : 0
      });
    }
  }

  // Check if student already submitted this test
  const existingResult = test.results.find(result => 
    result.student.toString() === studentId.toString()
  );

  if (existingResult) {
    // Update existing result
    existingResult.score = totalScore;
    existingResult.correctAnswers = correctAnswers;
    existingResult.totalQuestions = test.questions.length;
    existingResult.timeSpent = timeSpent;
    existingResult.detailedResults = detailedResults;
    existingResult.submittedAt = new Date();
  } else {
    // Add new result
    test.results.push({
      student: studentId,
      score: totalScore,
      correctAnswers,
      totalQuestions: test.questions.length,
      timeSpent,
      detailedResults,
      submittedAt: new Date()
    });
  }

  await test.save();

  const result = existingResult || test.results[test.results.length - 1];

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Test result submitted successfully"));
});

const getTestResults = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const test = await Test.findById(id)
    .populate('results.student', 'fullName username email')
    .populate('results.detailedResults.questionId');
  
  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, test.results, "Test results fetched successfully"));
});

const getTestResultById = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  
  const test = await Test.findOne({ "results._id": resultId })
    .populate('results.student', 'fullName username email')
    .populate('results.detailedResults.questionId');
  
  if (!test) {
    throw new ApiError(404, "Test result not found");
  }
  const testId = test._id;
  const result = test.results.id(resultId);
  
  console.log(result);
  
  return res
    .status(200)
    .json(new ApiResponse(200, {result,testId}, "Test result fetched successfully"));
});

export {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  submitTestResult,
  getTestResults,
  getTestResultById,
};
