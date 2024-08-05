import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { PhysicalTest } from "../models/physicalTestModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subject } from "../models/subjectModel.js";

const createPhysicalTest = asyncHandler(async (req, res) => {
  const { name, description, teacherId, questions, dueDate,score,subjectid,standard } = req.body;



  if (!name || !teacherId || !subjectid) {
    throw new ApiError(400, "Name and teacherId are required");
  }
  const subject=await Subject.findById(subjectid)
  if (!subject) {
    throw new ApiError(400, "subejct not found are required");
  }
  const test = await PhysicalTest.create({
    name,
    description,
    teacher: teacherId,
    questions,
    dueDate,
    score,
    standard,
    subject:subject.name

  });

  return res
    .status(201)
    .json(new ApiResponse(201, test, "Physical test created successfully"));
});

export const ViewalltestBystandard = asyncHandler(async (req, res) => {
  const {id}=req.params;
  const standardTest = await PhysicalTest.find({standard:id});
  return res
  .status(201)
  .json(new ApiResponse(201,standardTest, "Test Result successfully fetch"));
})


export const ViewalltestBysubject = asyncHandler(async (req, res) => {
  const {subject,standard}=req.params;
  const subjectTest = await PhysicalTest.find({standard:standard,subject:subject});
  
  
  return res
  .status(201)
  .json(new ApiResponse(201,subjectTest, "Test Result successfully fetch"));
})

const getAllChaptersbystd = asyncHandler(async (req, res) => {
  const {std}=req.params;
  const standardTest = await ChapterTest.find({standard:std})
  return res
    .status(200)
    .json(new ApiResponse(200, standardTest, "Physical Test fetched successfully"));
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

export { createPhysicalTest, getPhysicalTests, getPhysicalTestById ,getAllChaptersbystd};
