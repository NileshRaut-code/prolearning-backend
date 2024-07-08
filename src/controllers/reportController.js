import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Report } from "../models/reportModel.js";
import { User } from "../models/userModel.js";
import { Topic } from "../models/topicModel.js";
import { Test } from "../models/testModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createReport = asyncHandler(async (req, res) => {
  const { studentId, topicId, testId, score, feedback } = req.body;

  if (!studentId || !topicId || !testId || !score) {
    throw new ApiError(400, "All fields are required");
  }

  const student = await User.findById(studentId);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new ApiError(404, "Topic not found");
  }

  const test = await Test.findById(testId);
  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  const report = await Report.create({
    student: studentId,
    topic: topicId,
    test: testId,
    score,
    feedback,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, report, "Report created successfully"));
});

const getAllReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({})
    .populate('student', 'fullName username')
    .populate('topic', 'name')
    .populate('test', 'name');

  return res
    .status(200)
    .json(new ApiResponse(200, reports, "Reports fetched successfully"));
});

const getReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await Report.findById(id)
    .populate('student', 'fullName username')
    .populate('topic', 'name')
    .populate('test', 'name');

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, report, "Report fetched successfully"));
});

const updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { score, feedback } = req.body;

  const report = await Report.findById(id);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  report.score = score !== undefined ? score : report.score;
  report.feedback = feedback || report.feedback;

  const updatedReport = await report.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedReport, "Report updated successfully"));
});

const deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await Report.findById(id);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  await report.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Report deleted successfully"));
});

const getReportsByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const reports = await Report.find({ student: studentId })
    .populate('topic', 'name')
    .populate('test', 'name');

  if (!reports.length) {
    throw new ApiError(404, "No reports found for this student");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, reports, "Reports fetched successfully"));
});

export {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  getReportsByStudent,
};
