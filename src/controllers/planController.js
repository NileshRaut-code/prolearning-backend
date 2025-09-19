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

// Mark a topic as completed in a learning plan
export const markTopicCompleted = asyncHandler(async (req, res) => {
  const { planId, topicId } = req.params;
  const { progress = 100 } = req.body;

  const learningPlan = await LearningPlan.findById(planId);

  if (!learningPlan) {
    throw new ApiError(404, "Learning Plan not found");
  }

  const topicIndex = learningPlan.recommendedTopics.findIndex(
    topic => topic.topicId.toString() === topicId
  );

  if (topicIndex === -1) {
    throw new ApiError(404, "Topic not found in this learning plan");
  }

  // Update topic completion status
  learningPlan.recommendedTopics[topicIndex].isCompleted = true;
  learningPlan.recommendedTopics[topicIndex].completedAt = new Date();
  learningPlan.recommendedTopics[topicIndex].progress = progress;

  await learningPlan.save();

  const updatedPlan = await LearningPlan.findById(planId)
    .populate('student', '-password -refreshToken')
    .populate('recommendedTopics.topicId');

  res.status(200).json({
    success: true,
    message: "Topic marked as completed",
    data: updatedPlan
  });
});

// Update topic progress in a learning plan
export const updateTopicProgress = asyncHandler(async (req, res) => {
  const { planId, topicId } = req.params;
  const { progress } = req.body;

  if (progress < 0 || progress > 100) {
    throw new ApiError(400, "Progress must be between 0 and 100");
  }

  const learningPlan = await LearningPlan.findById(planId);

  if (!learningPlan) {
    throw new ApiError(404, "Learning Plan not found");
  }

  const topicIndex = learningPlan.recommendedTopics.findIndex(
    topic => topic.topicId.toString() === topicId
  );

  if (topicIndex === -1) {
    throw new ApiError(404, "Topic not found in this learning plan");
  }

  // Update topic progress
  learningPlan.recommendedTopics[topicIndex].progress = progress;
  
  // Mark as completed if progress is 100%
  if (progress === 100) {
    learningPlan.recommendedTopics[topicIndex].isCompleted = true;
    learningPlan.recommendedTopics[topicIndex].completedAt = new Date();
  } else {
    learningPlan.recommendedTopics[topicIndex].isCompleted = false;
    learningPlan.recommendedTopics[topicIndex].completedAt = null;
  }

  await learningPlan.save();

  const updatedPlan = await LearningPlan.findById(planId)
    .populate('student', '-password -refreshToken')
    .populate('recommendedTopics.topicId');

  res.status(200).json({
    success: true,
    message: "Topic progress updated",
    data: updatedPlan
  });
});

// Get learning plan with detailed progress
export const getLearningPlanWithProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const learningPlan = await LearningPlan.findById(id)
    .populate('student', '-password -refreshToken')
    .populate('recommendedTopics.topicId');

  if (!learningPlan) {
    throw new ApiError(404, "Learning Plan not found");
  }

  // Calculate additional statistics
  const stats = {
    totalTopics: learningPlan.totalTopicsCount,
    completedTopics: learningPlan.completedTopicsCount,
    pendingTopics: learningPlan.totalTopicsCount - learningPlan.completedTopicsCount,
    overallProgress: learningPlan.overallProgress,
    status: learningPlan.status,
    createdAt: learningPlan.createdAt,
    completedAt: learningPlan.completedAt,
    timeSpent: learningPlan.completedAt ? 
      Math.ceil((learningPlan.completedAt - learningPlan.createdAt) / (1000 * 60 * 60 * 24)) : null
  };

  res.status(200).json({
    success: true,
    data: learningPlan,
    stats
  });
});