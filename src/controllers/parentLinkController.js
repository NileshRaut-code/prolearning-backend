import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/userModel.js";
import crypto from "crypto";

// Generate linking code for student
export const generateLinkingCode = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  // Verify user is a student
  const student = await User.findById(studentId);
  if (!student || student.role !== 'STUDENT') {
    throw new ApiError(400, "Only students can generate linking codes");
  }

  // Generate unique 6-digit code
  let linkingCode;
  let isUnique = false;
  
  while (!isUnique) {
    linkingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existingUser = await User.findOne({ linkingCode });
    if (!existingUser) {
      isUnique = true;
    }
  }

  // Update student with linking code
  student.linkingCode = linkingCode;
  await student.save();

  res.status(200).json({
    success: true,
    message: "Linking code generated successfully",
    data: {
      linkingCode,
      expiresIn: "24 hours"
    }
  });
});

// Link parent to student using code
export const linkParentToStudent = asyncHandler(async (req, res) => {
  const { linkingCode } = req.body;
  const parentId = req.user._id;

  // Verify user is a parent
  const parent = await User.findById(parentId);
  if (!parent || parent.role !== 'PARENT') {
    throw new ApiError(400, "Only parents can link to students");
  }

  // Find student with linking code
  const student = await User.findOne({ linkingCode });
  if (!student) {
    throw new ApiError(404, "Invalid linking code");
  }

  // Check if already linked
  if (parent.studentId && parent.studentId.toString() === student._id.toString()) {
    throw new ApiError(400, "Already linked to this student");
  }

  // Link parent to student
  parent.studentId = student._id;
  parent.isLinked = true;

  // Add parent to student's parent list
  if (!student.parentIds.includes(parentId)) {
    student.parentIds.push(parentId);
  }
  student.isLinked = true;
  
  // Clear the linking code after successful link
  student.linkingCode = undefined;

  await parent.save();
  await student.save();

  const linkedStudent = await User.findById(student._id).select('-password -refreshToken');

  res.status(200).json({
    success: true,
    message: "Successfully linked to student",
    data: {
      student: linkedStudent
    }
  });
});

// Get linked student for parent
export const getLinkedStudent = asyncHandler(async (req, res) => {
  const parentId = req.user._id;

  const parent = await User.findById(parentId).populate('studentId', '-password -refreshToken');
  
  if (!parent || parent.role !== 'PARENT') {
    throw new ApiError(400, "Only parents can access this endpoint");
  }

  if (!parent.studentId) {
    throw new ApiError(404, "No student linked to this parent");
  }

  res.status(200).json({
    success: true,
    data: {
      student: parent.studentId
    }
  });
});

// Get linked parents for student
export const getLinkedParents = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const student = await User.findById(studentId).populate('parentIds', '-password -refreshToken');
  
  if (!student || student.role !== 'STUDENT') {
    throw new ApiError(400, "Only students can access this endpoint");
  }

  res.status(200).json({
    success: true,
    data: {
      parents: student.parentIds || []
    }
  });
});

// Unlink parent from student
export const unlinkParentFromStudent = asyncHandler(async (req, res) => {
  const parentId = req.user._id;

  const parent = await User.findById(parentId);
  if (!parent || parent.role !== 'PARENT') {
    throw new ApiError(400, "Only parents can unlink");
  }

  if (!parent.studentId) {
    throw new ApiError(404, "No student linked to this parent");
  }

  const studentId = parent.studentId;

  // Remove link from parent
  parent.studentId = undefined;
  parent.isLinked = false;

  // Remove parent from student's parent list
  const student = await User.findById(studentId);
  if (student) {
    student.parentIds = student.parentIds.filter(id => id.toString() !== parentId.toString());
    if (student.parentIds.length === 0) {
      student.isLinked = false;
    }
    await student.save();
  }

  await parent.save();

  res.status(200).json({
    success: true,
    message: "Successfully unlinked from student"
  });
});

// Get student performance data for parent
export const getStudentPerformanceForParent = asyncHandler(async (req, res) => {
  const parentId = req.user._id;

  const parent = await User.findById(parentId);
  if (!parent || parent.role !== 'PARENT' || !parent.studentId) {
    throw new ApiError(400, "Parent not linked to any student");
  }

  const studentId = parent.studentId;

  // Import models dynamically to avoid circular dependencies
  const { default: mongoose } = await import('mongoose');
  
  // Get test results
  const testResults = await mongoose.model('Test').find({ 
    'results.student': studentId 
  }).populate('results.student', 'fullName');

  // Get physical test results
  const physicalTestResults = await mongoose.model('PhysicalTest').find({ 
    student: studentId 
  }).populate('student', 'fullName').populate('test', 'name subject');

  // Get learning plans
  const learningPlans = await mongoose.model('LearningPlan').find({ 
    student: studentId 
  }).populate('student', 'fullName');

  // Calculate performance metrics
  const totalTests = testResults.length + physicalTestResults.length;
  const passedTests = physicalTestResults.filter(result => result.isPassed).length;
  const averageScore = physicalTestResults.length > 0 
    ? physicalTestResults.reduce((acc, result) => acc + (result.score || 0), 0) / physicalTestResults.length 
    : 0;

  const performanceData = {
    student: await User.findById(studentId).select('-password -refreshToken'),
    stats: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      averageScore: Math.round(averageScore),
      completedLearningPlans: learningPlans.filter(plan => plan.status === 'Completed').length,
      activeLearningPlans: learningPlans.filter(plan => plan.status === 'In Progress').length
    },
    recentTests: physicalTestResults.slice(-5),
    learningPlans: learningPlans.slice(-3)
  };

  res.status(200).json({
    success: true,
    data: performanceData
  });
});
