import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { PhysicalTest } from "../models/physicalTestModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPhysicalTest = asyncHandler(async (req, res) => {
  const { name, description, teacherId, questions, dueDate,score } = req.body;
  console.log(req.body);
  if (!name || !teacherId) {
    throw new ApiError(400, "Name and teacherId are required");
  }

  const test = await PhysicalTest.create({
    name,
    description,
    teacher: teacherId,
    questions,
    dueDate,
    score
  });

  return res
    .status(201)
    .json(new ApiResponse(201, test, "Physical test created successfully"));
});

const getPhysicalTests = asyncHandler(async (req, res) => {
  const tests = await PhysicalTest.find().populate("teacher", "fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, tests, "Physical tests fetched successfully"));
});

const getPhysicalTestById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  const test = await PhysicalTest.findById(testId).populate("teacher", "fullName");

  if (!test) {
    throw new ApiError(404, "Physical test not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, test, "Physical test fetched successfully"));
});

export { createPhysicalTest, getPhysicalTests, getPhysicalTestById };
