import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/userModel.js";
import { Test } from "../models/testModel.js";
import { PhysicalTest } from "../models/physicalTestModel.js";
import { LearningPlan } from "../models/learningplanModel.js";
import mongoose from "mongoose";

// Get comprehensive student performance data
export const getStudentPerformance = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Verify user is a student
  const student = await User.findById(studentId);
  if (!student || student.role !== 'STUDENT') {
    throw new ApiError(400, "Only students can access performance data");
  }

  try {

    // Get MCQ test results
    const mcqTests = await Test.find({
      'results.student': studentId
    }).populate({
      path: 'topic',
      select: 'name chapter',
      populate: {
        path: 'chapter',
        select: 'name subject',
        populate: {
          path: 'subject',
          select: 'name'
        }
      }
    });

    // Extract student-specific results from MCQ tests
    const mcqResults = [];
    mcqTests.forEach(test => {
      const studentResult = test.results.find(result => 
        result.student.toString() === studentId.toString()
      );
      if (studentResult) {
        mcqResults.push({
          testId: test._id,
          testName: test.name,
          subject: test.topic?.chapter?.subject?.name || 'Unknown',
          chapter: test.topic?.chapter?.name || 'Unknown',
          topic: test.topic?.name || 'Unknown',
          score: studentResult.score,
          totalMarks: studentResult.totalQuestions || test.questions?.length || 0,
          percentage: studentResult.totalQuestions ? Math.round((studentResult.score / studentResult.totalQuestions) * 100) : 0,
          timeTaken: studentResult.timeSpent,
          submittedAt: studentResult.submittedAt,
          type: 'MCQ'
        });
      }
    });

    // Get physical test results
    const physicalTests = await PhysicalTest.find({ 
      student: studentId 
    }).populate('test', 'name subject score').populate('student', 'fullName');

    const physicalResults = physicalTests.map(result => ({
      testId: result.test._id,
      testName: result.test.name,
      subject: result.test.subject || 'Unknown',
      score: result.score || 0,
      totalMarks: result.test.score,
      percentage: result.test.score ? Math.round((result.score / result.test.score) * 100) : 0,
      grade: result.grade,
      isPassed: result.isPassed,
      attempts: result.attempts,
      maxAttempts: result.maxAttempts,
      submittedAt: result.updatedAt,
      type: 'Physical'
    }));

    // Get learning plans
    const learningPlans = await LearningPlan.find({ 
      student: studentId 
    }).populate('recommendedTopics.topicId', 'name');

    // Calculate overall statistics
    const allResults = [...mcqResults, ...physicalResults];
    const totalTests = allResults.length;
    const passedTests = physicalResults.filter(result => result.isPassed).length + 
                       mcqResults.filter(result => result.percentage >= 60).length;
    
    const averageScore = totalTests > 0 
      ? Math.round(allResults.reduce((acc, result) => acc + result.percentage, 0) / totalTests)
      : 0;

    // Subject-wise performance
    const subjectPerformance = {};
    allResults.forEach(result => {
      if (!subjectPerformance[result.subject]) {
        subjectPerformance[result.subject] = {
          totalTests: 0,
          totalScore: 0,
          passedTests: 0
        };
      }
      subjectPerformance[result.subject].totalTests++;
      subjectPerformance[result.subject].totalScore += result.percentage;
      if (result.percentage >= 60 || result.isPassed) {
        subjectPerformance[result.subject].passedTests++;
      }
    });

    // Calculate subject averages
    Object.keys(subjectPerformance).forEach(subject => {
      const data = subjectPerformance[subject];
      data.averageScore = Math.round(data.totalScore / data.totalTests);
      data.passRate = Math.round((data.passedTests / data.totalTests) * 100);
    });

    // Recent activity (last 10 tests)
    const recentActivity = allResults
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 10);

    // Performance trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentResults = allResults.filter(result => 
      new Date(result.submittedAt) >= thirtyDaysAgo
    );

    // Learning plan statistics
    const learningPlanStats = {
      total: learningPlans.length,
      completed: learningPlans.filter(plan => plan.status === 'Completed').length,
      inProgress: learningPlans.filter(plan => plan.status === 'In Progress').length,
      pending: learningPlans.filter(plan => plan.status === 'Pending').length,
      totalTopics: learningPlans.reduce((acc, plan) => acc + (plan.totalTopicsCount || 0), 0),
      completedTopics: learningPlans.reduce((acc, plan) => acc + (plan.completedTopicsCount || 0), 0)
    };

    // Strengths and weaknesses analysis
    const strongSubjects = Object.entries(subjectPerformance)
      .filter(([_, data]) => data.averageScore >= 75)
      .map(([subject, data]) => ({ subject, averageScore: data.averageScore }))
      .sort((a, b) => b.averageScore - a.averageScore);

    const weakSubjects = Object.entries(subjectPerformance)
      .filter(([_, data]) => data.averageScore < 60)
      .map(([subject, data]) => ({ subject, averageScore: data.averageScore }))
      .sort((a, b) => a.averageScore - b.averageScore);

    const performanceData = {
      student: {
        id: student._id,
        name: student.fullName,
        standard: student.standard,
        email: student.email
      },
      overview: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        averageScore,
        passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
      },
      subjectPerformance,
      recentActivity,
      recentResults: recentResults.length,
      learningPlanStats,
      strengths: strongSubjects.slice(0, 3),
      weaknesses: weakSubjects.slice(0, 3),
      testHistory: {
        mcq: mcqResults.slice(-5),
        physical: physicalResults.slice(-5)
      },
      learningPlans: learningPlans.map(plan => ({
        id: plan._id,
        status: plan.status,
        overallProgress: plan.overallProgress,
        totalTopics: plan.totalTopicsCount,
        completedTopics: plan.completedTopicsCount,
        createdAt: plan.createdAt,
        completedAt: plan.completedAt
      }))
    };

    res.status(200).json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    console.error('Error fetching performance data:', error);
    throw new ApiError(500, "Error fetching performance data");
  }
});

// Get performance analytics for a specific time period
export const getPerformanceAnalytics = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { period = '30' } = req.query; // days

  const student = await User.findById(studentId);
  if (!student || student.role !== 'STUDENT') {
    throw new ApiError(400, "Only students can access performance analytics");
  }

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(period));

  try {
    // Get tests within the period
    const testsInPeriod = await PhysicalTest.find({
      student: studentId,
      updatedAt: { $gte: daysAgo }
    }).populate('test', 'name subject score');

    // Daily performance data
    const dailyPerformance = {};
    testsInPeriod.forEach(test => {
      const date = test.updatedAt.toISOString().split('T')[0];
      if (!dailyPerformance[date]) {
        dailyPerformance[date] = {
          tests: 0,
          totalScore: 0,
          passed: 0
        };
      }
      dailyPerformance[date].tests++;
      dailyPerformance[date].totalScore += test.score || 0;
      if (test.isPassed) {
        dailyPerformance[date].passed++;
      }
    });

    // Convert to array format for charts
    const performanceChart = Object.entries(dailyPerformance).map(([date, data]) => ({
      date,
      averageScore: Math.round(data.totalScore / data.tests),
      testsCount: data.tests,
      passRate: Math.round((data.passed / data.tests) * 100)
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      data: {
        period: `${period} days`,
        totalTests: testsInPeriod.length,
        performanceChart,
        summary: {
          averageScore: testsInPeriod.length > 0 
            ? Math.round(testsInPeriod.reduce((acc, test) => acc + (test.score || 0), 0) / testsInPeriod.length)
            : 0,
          passRate: testsInPeriod.length > 0 
            ? Math.round((testsInPeriod.filter(test => test.isPassed).length / testsInPeriod.length) * 100)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    throw new ApiError(500, "Error fetching performance analytics");
  }
});

// Get subject-wise detailed performance
export const getSubjectPerformance = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { subject } = req.params;

  const student = await User.findById(studentId);
  if (!student || student.role !== 'STUDENT') {
    throw new ApiError(400, "Only students can access subject performance");
  }

  try {
    // Get all tests for the subject
    const subjectTests = await PhysicalTest.find({
      student: studentId
    }).populate({
      path: 'test',
      match: { subject: subject },
      select: 'name subject score'
    });

    // Filter out tests where populate didn't match
    const validTests = subjectTests.filter(test => test.test);

    const subjectData = {
      subject,
      totalTests: validTests.length,
      passedTests: validTests.filter(test => test.isPassed).length,
      averageScore: validTests.length > 0 
        ? Math.round(validTests.reduce((acc, test) => acc + (test.score || 0), 0) / validTests.length)
        : 0,
      bestScore: validTests.length > 0 
        ? Math.max(...validTests.map(test => test.score || 0))
        : 0,
      recentTests: validTests.slice(-10).map(test => ({
        testName: test.test.name,
        score: test.score,
        totalMarks: test.test.score,
        percentage: test.test.score ? Math.round((test.score / test.test.score) * 100) : 0,
        isPassed: test.isPassed,
        submittedAt: test.updatedAt
      }))
    };

    res.status(200).json({
      success: true,
      data: subjectData
    });

  } catch (error) {
    console.error('Error fetching subject performance:', error);
    throw new ApiError(500, "Error fetching subject performance");
  }
});
