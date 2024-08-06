import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { PhysicalAnswerCopy } from "../models/physicalAnswerCopyModel.js";
import { PhysicalTest } from "../models/physicalTestModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary,uploadImageToCloudinary,uploadPdfToCloudinary } from "../utils/cloudinary.js";

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
  const { answerCopyId, grade, feedback } = req.body;

  const answerCopy = await PhysicalAnswerCopy.findById(answerCopyId);

  if (!answerCopy) {
    throw new ApiError(404, "Answer copy not found");
  }

  answerCopy.grade = grade;
  answerCopy.feedback = feedback;
  await answerCopy.save();

  return res
    .status(200)
    .json(new ApiResponse(200, answerCopy, "Answer copy graded successfully"));
});

const getAnswerCopy = asyncHandler(async (req, res) => {
  const { answerCopyId } = req.params;

  const answerCopy = await PhysicalAnswerCopy.findById(answerCopyId)
    .populate("student", "fullName")
    .populate("teacher", "fullName")
    .populate("test");

  if (!answerCopy) {
    throw new ApiError(404, "Answer copy not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, answerCopy, "Answer copy fetched successfully"));
});

export { submitAnswerCopy, gradeAnswerCopy, getAnswerCopy };
