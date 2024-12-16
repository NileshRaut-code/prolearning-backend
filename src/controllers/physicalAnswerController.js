import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { PhysicalAnswerCopy } from "../models/physicalAnswerCopyModel.js";
import { PhysicalTest } from "../models/physicalTestModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary,uploadImageToCloudinary,uploadPdfToCloudinary } from "../utils/cloudinary.js";
import { Topic } from "../models/topicModel.js";
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
    // Update the existing submission
    submission.pdfUrl = pdfUploadResult.url;
    submission.updatedAt = new Date();
  } else {
    // Create a new submission
    submission = await PhysicalAnswerCopy.create({
      student: studentId,
      teacher: teacherId,
      test: testId,
      pdfPath: pdfUploadResult.url,
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

const gradeAnswerCopy = asyncHandler(async (req, res) => {
  const { answerCopyId, grade, feedback,recommendations,score } = req.body;
  console.log("score",score);
  
  if (!answerCopyId || !grade || !recommendations) {
    throw new ApiError(404, "All Field are required");
  }
  const answerCopy = await PhysicalAnswerCopy.findById(answerCopyId);

  if (!answerCopy) {
    throw new ApiError(404, "Answer copy not found");
  }
  // answerCopy.pdfPath = pdfPath;
  answerCopy.grade = grade;
  answerCopy.feedback = feedback;
  answerCopy.recommendations = recommendations;
  answerCopy.score = score;

  let learningPlan;
  if (recommendations && recommendations.length > 0) {
    // Generate a learning plan if recommendations are present
    const recommendedTopics = recommendations.map((rec) => rec.topicId);

    // Fetch topics
    const topics = await Topic.find({ _id: { $in: recommendedTopics } });

    if (topics && topics.length > 0) {
      // Generate AI-driven Q&A for recommended topics
      const generatedData = await Promise.all(
        topics.map(async (topic) => {
          const prompt = `
            Create 5 questions and answers for the topic: ${topic.name}.
            Format: { "question": string, "answer": string, "difficultyLevel": string ("Easy", "Medium", "Hard"), "tags": array of strings (keywords or concepts) }.
          `;

          try {
            const result = await model.generateContent(prompt);
            const qna = JSON.parse(result.response.text());
            return { topicId: topic._id, topicName: topic.name, aiGeneratedQnA: qna };
          } catch (error) {
            console.error(`AI generation failed for topic: ${topic.name}`, error);
            return { topicId: topic._id, topicName: topic.name, aiGeneratedQnA: [] };
          }
        })
      );

      // Create the learning plan
      learningPlan = new LearningPlan({
        student: req.user._id,
        recommendedTopics: generatedData,
      });

      await learningPlan.save();

      // Associate the learning plan with the answer copy
      answerCopy.planId = learningPlan._id;
    }
  }

  // Save the updated answer copy
  await answerCopy.save();


  return res
    .status(200)
    .json(new ApiResponse(200, answerCopy, "Answer copy graded successfully"));
});

const alreadycheck = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log( req.user);
  
  const answerCopy = await PhysicalAnswerCopy.findOne({ test: id, student: req.user._id });

  // .populate("recommendations.topicId")

  if (!answerCopy) {
    throw new ApiError(404, "Answer copy not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, answerCopy, "Answer copy fetched successfully"));
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
