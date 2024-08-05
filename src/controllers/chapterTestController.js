import { Chapter } from "../models/chapterModel.js";
import { Question } from "../models/questionModel.js";
import { ChapterTest } from "../models/chapterTestModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { ChapterTestResult } from "../models/chapterTestResultModel.js";
import { Recommendation } from "../models/recommendation.model.js";
import { Subject } from "../models/subjectModel.js";

const getRandomQuestions = (questions, number) => {
  let shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, number);
};

export const createChapterTest = asyncHandler(async (req, res) => {
  const { chapterId, testName, questionsPerTopic } = req.body;

  if (!chapterId || !testName || !questionsPerTopic) {
    throw new ApiError(400, "Chapter ID, test name, and questions per topic are required");
  }

  const chapter = await Chapter.findById(chapterId).populate('topics');

  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  let questions = [];
  for (let topic of chapter.topics) {
    const topicQuestions = await Question.find({ topic: topic._id });
    if (topicQuestions.length > 0) {
      questions = questions.concat(getRandomQuestions(topicQuestions, questionsPerTopic));
    }
  }
  const chapterfind = await Chapter.findById(chapterId);
  const standard = await Subject.findById(chapterfind.subject).populate('standard');
  const chapterTest = await ChapterTest.create({ chapterId, testName, questions ,standard:standard.standard.name,subject:standard.name});

  return res
    .status(201)
    .json(new ApiResponse(201, chapterTest, "Chapter test created successfully"));
});




const calculateScore = (answers, questions) => {
  let score = 0;
  answers.forEach(answer => {
    const question = questions.find(q => q._id.toString() === answer.questionId);
    if (question && question.correctAnswer === answer.answer) {
      score += 1;
    }
  });
  return score;
};

const generateRecommendations = async (studentId, questions, answers) => {
  const recommendations = [];
  for (let answer of answers) {
    const question = questions.find(q => q._id.toString() === answer.questionId);
    if (question && question.correctAnswer !== answer.answer) {
      const recommendation = await Recommendation.create({
        studentId,
        topicId: question.topic,
        message: `You should review the topic: ${question.topic.name}.`
      });
      recommendations.push(recommendation._id);
    }
  }
  return recommendations;
};

export const submitChapterTestResult = asyncHandler(async (req, res) => {
  const { testId, studentId, answers } = req.body;

  if (!testId || !studentId || !answers) {
    throw new ApiError(400, "Test ID, student ID, and answers are required");
  }

  const chapterTest = await ChapterTest.findById(testId).populate('questions');
  if (!chapterTest) {
    throw new ApiError(404, "Chapter test not found");
  }

  const score = calculateScore(answers, chapterTest.questions);

  const recommendations = await generateRecommendations(studentId, chapterTest.questions, answers);

  let submission = await ChapterTestResult.findOne({ test: testId, student: studentId });

  if (submission) {
    // Update the existing submission
    submission.recommendations = recommendations;
    submission.score = score;
    submission.updatedAt = new Date();
  } else {
    // Create a new submission
    submission = await ChapterTestResult.create({
      testId,
      studentId,
      score,
      recommendations
    });
  }

  await submission.save();




  return res
    .status(201)
    .json(new ApiResponse(201, submission, "Test result submitted successfully"));
});


export const viewChapterTest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Test ID are required");
  }

  const chapterTest = await ChapterTest.findById(id).populate('questions');
  if (!chapterTest) {
    throw new ApiError(404, "Chapter test not found");
  }



  
return res
  .status(201)
  .json(new ApiResponse(201, chapterTest, "Test successfully fetch"));
})


export const viewChapterTestbychapterid = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;

  if (!chapterId) {
    throw new ApiError(400, "Test ID are required");
  }

  const chapterTest = await ChapterTest.find({chapterId:chapterId}).populate('questions');
  if (!chapterTest) {
    throw new ApiError(404, "Chapter test not found");
  }
return res
  .status(201)
  .json(new ApiResponse(201, chapterTest, "Test successfully fetch"));
})


export const viewChapterResultid = asyncHandler(async (req, res) => {
  const {id}=req.params;
  if (!id) {
    throw new ApiError(400, "Test ID are required");
  }
  const TestResult=await ChapterTestResult.findById(id)
  .populate({
    path: 'recommendations',
    populate: {
      path: 'topicId',
      model: 'Topic'
    }
  });


  if (!TestResult) {
    throw new ApiError(404, " test reuslt not found");
  }

  const uniqueRecommendations = [];
  const seenTopics = new Set();

  TestResult.recommendations.forEach(rec => {
    if (!seenTopics.has(rec.topicId._id.toString())) {
      seenTopics.add(rec.topicId._id.toString());
      uniqueRecommendations.push(rec);
    }
  });

  // Replace recommendations with unique recommendations
  TestResult.recommendations = uniqueRecommendations;

  return res
  .status(201)
  .json(new ApiResponse(201, TestResult, "Test Result successfully fetch"));
})


export const ViewalltestBystandard = asyncHandler(async (req, res) => {
  const {id}=req.params;
  const standardTest = await ChapterTest.find({standard:id});


  return res
  .status(201)
  .json(new ApiResponse(201,standardTest, "Test Result successfully fetch"));
})


export const ViewalltestBysubject = asyncHandler(async (req, res) => {
  const {subject,standard}=req.params;
  const subjectTest = await ChapterTest.find({standard:standard,subject:subject});
  
  
  return res
  .status(201)
  .json(new ApiResponse(201,subjectTest, "Test Result successfully fetch"));
})