import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { PhysicalAnswerCopy } from "../models/physicalAnswerCopyModel.js";
import { PhysicalTest } from "../models/physicalTestModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary,uploadImageToCloudinary,uploadPdfToCloudinary } from "../utils/cloudinary.js";
import { Topic } from "../models/topicModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LearningPlan } from "../models/learningplanModel.js";
import nodemailer from "nodemailer"

const submitAnswerCopy = asyncHandler(async (req, res) => {
  const { studentId, teacherId, testId } = req.body;

  if (!req.file) {
    throw new ApiError(400, "PDF file is required");
  }
  console.log(req.file);
    const pdfbuffer=req.file.buffer;
//   const pdfUploadResult = await uploadOnCloudinary(req.file.path);


    const pdfUploadResult = await uploadPdfToCloudinary(pdfbuffer);
    if (!pdfUploadResult) {
      throw new ApiError(404, "Image is not Uploaded Properly");
    }
   
  
  console.log(pdfUploadResult)
  if (!pdfUploadResult.url) {
    throw new ApiError(500, "Error uploading PDF");
  }

  const test = await PhysicalTest.findById(testId);
  if (!test) {
    throw new ApiError(404, "Test not found");
  }
  

  let submission = await PhysicalAnswerCopy.findOne({ test: testId, student: studentId });

  if (submission) {
    // Check if student can resubmit
    if (submission.isPassed) {
      throw new ApiError(400, "Test already passed. No resubmission allowed.");
    }
    
    if (submission.attempts >= submission.maxAttempts) {
      throw new ApiError(400, "Maximum attempts reached. Cannot resubmit.");
    }
    
    // Update the existing submission for retry
    submission.pdfPath = pdfUploadResult.url;
    submission.attempts += 1;
    submission.status = "resubmitted";
    submission.grade = "Not graded";
    submission.score = 0;
    submission.updatedAt = new Date();
  } else {
    // Create a new submission
    submission = await PhysicalAnswerCopy.create({
      student: studentId,
      teacher: teacherId,
      test: testId,
      pdfPath: pdfUploadResult.url,
      status: "submitted",
      attempts: 1
    });
  }

  await submission.save();


  // const answerCopy = await PhysicalAnswerCopy.create({
  //   student: studentId,
  //   teacher: teacherId,
  //   test: testId,
  //   pdfPath: pdfUploadResult.url,
  // });

  return res
    .status(201)
    .json(new ApiResponse(201, submission, "Answer copy submitted successfully"));
});

const generateQuestionsForTopic = async (topic) => {
  const genAI = new GoogleGenerativeAI(process.env.APIAI);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    Generate 5 questions and answers for the topic: "${topic.name}".
    Format: [{"question": "string", "answer": "string", "difficultyLevel": "Easy|Medium|Hard", "tags": ["tag1", "tag2"]}]
  `;

  try {
    // AI API call (replace `model.generateContent` with your API method)
    const aiResponse = await model.generateContent(prompt);

    // Log the raw AI response
    console.log("Raw AI Response:", aiResponse);

    // Post-process: Remove unwanted characters (e.g., backticks)
    let cleanResponse = aiResponse.response.text().trim();
    console.log(aiResponse.response.text());
    
    cleanResponse = cleanResponse.replace(/```json|```/g, ""); // Remove Markdown formatting

    // Parse the JSON response
    const qna = JSON.parse(cleanResponse);

    // Validate the response format
    if (Array.isArray(qna) && qna.every(q => q.question && q.answer)) {
      return {
        topicId: topic._id,
        topicName: topic.name,
        aiGeneratedQnA: qna,
      };
    } else {
      console.error("Invalid AI-generated QnA format:", qna);
      return { topicId: topic._id, topicName: topic.name, aiGeneratedQnA: [] };
    }
  } catch (error) {
    console.error(`AI generation failed for topic: ${topic.name}`, error.message);
    return { topicId: topic._id, topicName: topic.name, aiGeneratedQnA: [] };
  }
};

const gradeAnswerCopy = asyncHandler(async (req, res) => {
  const { answerCopyId, grade, feedback, recommendations, score } = req.body;

  if (!answerCopyId || !grade || !recommendations) {
    throw new ApiError(404, "All fields are required");
  }

  const answerCopy = await PhysicalAnswerCopy.findById(answerCopyId);

  if (!answerCopy) {
    throw new ApiError(404, "Answer copy not found");
  }

  // Get the test to calculate total marks
  const test = await PhysicalTest.findById(answerCopy.test);
  const totalMarks = test ? test.score : 100;
  const percentage = (score / totalMarks) * 100;
  
  answerCopy.grade = grade;
  answerCopy.feedback = feedback;
  answerCopy.recommendations = recommendations;
  answerCopy.score = score;
  answerCopy.status = "graded";
  
  // Determine if student passed
  if (percentage >= answerCopy.passingScore) {
    answerCopy.isPassed = true;
    answerCopy.status = "passed";
  } else {
    answerCopy.isPassed = false;
    answerCopy.status = "failed";
  }

  if (!recommendations.length && answerCopy.planId) {
    await LearningPlan.findByIdAndDelete(answerCopy.planId);
    answerCopy.planId = null;
  } else if (recommendations && recommendations.length > 0) {
    let learningPlan;

    if (answerCopy.planId) {
      learningPlan = await LearningPlan.findById(answerCopy.planId);

      if (!learningPlan) {
        throw new ApiError(404, "Learning plan not found");
      }

      const newTopics = recommendations.filter(
        (rec) => !learningPlan.recommendedTopics.some((topic) => topic.topicId.equals(rec.topicId))
      );

      if (newTopics.length > 0) {
        const topics = await Topic.find({ _id: { $in: newTopics.map((rec) => rec.topicId) } });

        const generatedData = await Promise.all(
          topics.map(async (topic) => await generateQuestionsForTopic(topic))
        );

        learningPlan.recommendedTopics.push(...generatedData);
        await learningPlan.save();
      }
    } else {
      const recommendedTopics = recommendations.map((rec) => rec.topicId);

      const topics = await Topic.find({ _id: { $in: recommendedTopics } });

      if (topics && topics.length > 0) {
        const generatedData = await Promise.all(
          topics.map(async (topic) => await generateQuestionsForTopic(topic))
        );

        learningPlan = new LearningPlan({
          student: answerCopy.student,
          recommendedTopics: generatedData,
        });

        await learningPlan.save();
        answerCopy.planId = learningPlan._id;
      }
    }
  }

  await answerCopy.save();
  const transporter=nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASS
    }
  });
  await transporter.sendMail({
    from: process.env.MAIL_ID,
    to: "ganya9970@gmail.com",
    subject: "Grade of your test",
    text: `Your test has been graded with ${grade} and feedback is ${feedback}`
  }) 
  return res.status(200).json(
    new ApiResponse(200, answerCopy, "Answer copy graded successfully")
  );
});

const alreadycheck = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log( req.user);
  
  const answerCopy = await PhysicalAnswerCopy.findOne({ test: id, student: req.user._id })
    .populate('test', 'name score');

  if (!answerCopy) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No submission found"));
  }

  // Calculate additional info
  const canRetry = !answerCopy.isPassed && answerCopy.attempts < answerCopy.maxAttempts;
  const remainingAttempts = answerCopy.maxAttempts - answerCopy.attempts;
  
  const responseData = {
    ...answerCopy.toObject(),
    canRetry,
    remainingAttempts,
    isCompleted: answerCopy.isPassed,
    needsGrading: answerCopy.status === "submitted" || answerCopy.status === "resubmitted"
  };

  return res
    .status(200)
    .json(new ApiResponse(200, responseData, "Answer copy status fetched successfully"));
});
const getAnswerCopy = asyncHandler(async (req, res) => {
  const { answerCopyId } = req.params;

  const answerCopy = await PhysicalAnswerCopy.findById(answerCopyId)
    .populate("student", "fullName")
    .populate("teacher", "fullName")
    .populate("test")
    // .populate("recommendations.topicId")

  if (!answerCopy) {
    throw new ApiError(404, "Answer copy not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, answerCopy, "Answer copy fetched successfully"));
});

const getAnswerCopyResult = asyncHandler(async (req, res) => {
  const { answerCopyId } = req.params;

  const answerCopy = await PhysicalAnswerCopy.findById(answerCopyId)
    .populate("student", "fullName")
    .populate("teacher", "fullName")
    .populate("test")
    .populate('recommendations.topicId',"name")
    // .populate("recommendations.topicId")

  if (!answerCopy) {
    throw new ApiError(404, "Answer copy not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, answerCopy, "Answer copy fetched successfully"));
});



const getAllAnswerCopy = asyncHandler(async (req, res) => {
  const { standard } = req.params;
  console.log(standard);
  
  const answerCopies = await PhysicalAnswerCopy.find()
    .populate('test')
    .populate('student','fullName').populate('teacher','fullName')
  // Step 2: Manually filter the results based on the standard
  const filteredAnswerCopies = answerCopies.filter(answerCopy => answerCopy.test && answerCopy.test.standard === parseInt(standard));

  console.log('Filtered Answer Copies:', answerCopies);

  if (!filteredAnswerCopies) {
    throw new ApiError(404, "Answer copy not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, filteredAnswerCopies, "Answer copy fetched successfully"));
});

const getAllbyteacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  
  
  const answerCopies = await PhysicalAnswerCopy.find({teacher:teacherId})
  
  console.log(answerCopies,teacherId);
  
  if (!answerCopies) {
    throw new ApiError(404, "Answer copy not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, answerCopies, "Answer copy fetched successfully"));
});

const getAllAnswerCopysubjectwise = asyncHandler(async (req, res) => {
  const { standard } = req.params;
  const { subject } = req.params;
  console.log(standard);
  
  const answerCopies = await PhysicalAnswerCopy.find()
    .populate('test')
  // Step 2: Manually filter the results based on the standard
  const filteredAnswerCopies = answerCopies.filter(answerCopy => answerCopy.test && answerCopy.test.standard === parseInt(standard) && answerCopy.test.subject === subject);

  console.log('Filtered Answer Copies:', answerCopies);

  if (!filteredAnswerCopies) {
    throw new ApiError(404, "Answer copy not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, filteredAnswerCopies, "Answer copy fetched successfully"));
});

export { submitAnswerCopy,getAnswerCopyResult,alreadycheck, gradeAnswerCopy, getAnswerCopy,getAllAnswerCopy ,getAllAnswerCopysubjectwise,getAllbyteacher };
