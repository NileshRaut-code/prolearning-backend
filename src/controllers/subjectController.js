import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subject } from "../models/subjectModel.js";
import { Standard } from "../models/standardModel.js";
import { User } from "../models/userModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createSubject = asyncHandler(async (req, res) => {
  const { name, standardId, teacherId } = req.body;

  if (!name || !standardId || !teacherId) {
    throw new ApiError(400, "Name, standardId, and teacherId are required");
  }

  const standard = await Standard.findById(standardId);
  const teacher = await User.findById(teacherId);

  if (!standard || !teacher) {
    throw new ApiError(404, "Standard or Teacher not found");
  }

  const subject = await Subject.create({ name, standard: standardId, teacher: teacherId });
  standard.subjects.push(subject._id);
  await standard.save();

  return res
    .status(201)
    .json(new ApiResponse(201, subject, "Subject created successfully"));
});

const getAllSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({})
    .populate('standard','name')
    .populate('teacher','fullName')
    .populate('chapters','name');

  return res
    .status(200)
    .json(new ApiResponse(200, subjects, "Subjects fetched successfully"));
});

const getSubjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subject = await Subject.findById(id)
    .populate('standard','name')
    .populate('teacher','fullName')
    .populate('chapters','name');

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subject, "Subject fetched successfully"));
});

const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, standardId, teacherId } = req.body;

  const subject = await Subject.findById(id);

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  if (standardId) {
    const standard = await Standard.findById(standardId);
    if (!standard) {
      throw new ApiError(404, "Standard not found");
    }
    subject.standard = standardId;
  }

  if (teacherId) {
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    subject.teacher = teacherId;
  }

  subject.name = name || subject.name;

  const updatedSubject = await subject.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSubject, "Subject updated successfully"));
});

const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subject = await Subject.findById(id);

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  await subject.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subject deleted successfully"));
});
const getAllSubjectsbystandard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const standards = await Standard.find({name:parseInt(id)}).populate("subjects","name");
  console.log(standards);
  // if (!subject) {
  //   throw new ApiError(404, "Subject not found");
  // }

  // await subject.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {standards}, "Subject deleted successfully"));
});


export {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getAllSubjectsbystandard
};
