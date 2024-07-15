import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Test } from "../models/testModel.js";
import { Question } from "../models/questionModel.js";
import { User } from "../models/userModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTest = asyncHandler(async (req, res) => {
  const { name, questions } = req.body;
  const createdBy=req.user._id;
  console.log(createdBy);
  if (!name || !questions || !createdBy) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findById(createdBy);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const test = await Test.create({ name, questions, createdBy });

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
  const { name, questions } = req.body;

  const test = await Test.findById(id);

  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  test.name = name || test.name;
  test.questions = questions || test.questions;

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
    // Your code to handle test result submission
  });

export {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  submitTestResult,
};
