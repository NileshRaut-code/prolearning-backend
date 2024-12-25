import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { LearningPlan } from "../models/learningplanModel.js";

// Create a new learning plan
export const createLearningPlan = asyncHandler(async (req, res) => {
  const { student, recommendedTopics, status } = req.body;

  const learningPlan = new LearningPlan({
    student,
    recommendedTopics,
    status,
  });

  await learningPlan.save();

  res.status(201).json(learningPlan);
});

// Get a learning plan by ID
export const getLearningPlanById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const learningPlan = await LearningPlan.findById(id)
    .populate('student', '-password -refreshToken')
    .populate('recommendedTopics.topicId');

  if (!learningPlan) {
    throw new ApiError(404, "Learning Plan not found");
  }

  res.status(200).json(learningPlan);
});

// Update a learning plan by ID
export const updateLearningPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { student, recommendedTopics, status } = req.body;

  const learningPlan = await LearningPlan.findById(id);

  if (!learningPlan) {
    throw new ApiError(404, "Learning Plan not found");
  }

  learningPlan.student = student || learningPlan.student;
  learningPlan.recommendedTopics = recommendedTopics || learningPlan.recommendedTopics;
  learningPlan.status = status || learningPlan.status;

  await learningPlan.save();

  res.status(200).json(learningPlan);
});

// Delete a learning plan by ID
export const deleteLearningPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const learningPlan = await LearningPlan.findById(id);

  if (!learningPlan) {
    throw new ApiError(404, "Learning Plan not found");
  }

  await learningPlan.remove();

  res.status(204).json({ message: "Learning Plan deleted successfully" });
});

// Get all learning plans
export const getAllLearningPlans = asyncHandler(async (req, res) => {
  const learningPlans = await LearningPlan.find()
    .populate('student', '-password -refreshToken')
    .populate('recommendedTopics.topicId');

  res.status(200).json(learningPlans);
});

// Get all learning plans by student ID
export const getLearningPlansByStudentId = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const learningPlans = await LearningPlan.find({ student: studentId })
    .populate('student', '-password -refreshToken')
    .populate('recommendedTopics.topicId');

  if (!learningPlans.length) {
    throw new ApiError(404, "No Learning Plans found for this student");
  }

  res.status(200).json(learningPlans);
});