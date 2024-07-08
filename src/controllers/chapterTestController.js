import { Chapter } from "../models/chapterModel.js";
import { Question } from "../models/questionModel.js";
import { ChapterTest } from "../models/chapterTestModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { ChapterTestResult } from "../models/chapterTestResultModel.js";
import { Recommendation } from "../models/recommendation.model.js";

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

  const chapterTest = await ChapterTest.create({ chapterId, testName, questions });

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

  const testResult = await ChapterTestResult.create({
    testId,
    studentId,
    score,
    recommendations
  });

  return res
    .status(201)
    .json(new ApiResponse(201, testResult, "Test result submitted successfully"));
});
