import { Classroom } from "../models/classroom.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userModel.js";

// Create a Classroom
export const createClassroom = asyncHandler(async (req, res) => {
  const { name, subject, students } = req.body;
  const teacher = req.user._id;

  if (!name || !subject) {
    throw new ApiError(400, "Name and subject are required");
  }

  const classroom = await Classroom.create({ name, subject, teacher, students });

  return res
    .status(201)
    .json(new ApiResponse(201, classroom, "Classroom created successfully"));
});

// Get all Classrooms for the logged-in teacher
export const getClassrooms = asyncHandler(async (req, res) => {
  const teacher = req.user._id;
  const classrooms = await Classroom.find({ teacher }).populate("students", "-password");

  return res
    .status(200)
    .json(new ApiResponse(200, classrooms, "Classrooms retrieved successfully"));
});

// Get Classroom by ID
export const getClassroomById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teacher = req.user._id;

  const classroom = await Classroom.findOne({ _id: id, teacher }).populate("students", "-password");

  if (!classroom) {
    throw new ApiError(404, "Classroom not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, classroom, "Classroom retrieved successfully"));
});

// Update a Classroom
export const updateClassroom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teacher = req.user._id;

  const classroom = await Classroom.findOneAndUpdate(
    { _id: id, teacher },
    req.body,
    { new: true }
  );

  if (!classroom) {
    throw new ApiError(404, "Classroom not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, classroom, "Classroom updated successfully"));
});

// Delete a Classroom
export const deleteClassroom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teacher = req.user._id;

  const classroom = await Classroom.findOneAndDelete({ _id: id, teacher });

  if (!classroom) {
    throw new ApiError(404, "Classroom not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, classroom, "Classroom deleted successfully"));
});

// Add a Student to a Classroom
export const addStudentToClassroom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;
  const teacher = req.user._id;

  const classroom = await Classroom.findOne({ _id: id, teacher });

  if (!classroom) {
    throw new ApiError(404, "Classroom not found or unauthorized");
  }

  const student = await User.findById(studentId);

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  classroom.students.push(studentId);
  await classroom.save();

  return res
    .status(200)
    .json(new ApiResponse(200, classroom, "Student added to classroom successfully"));
});

// Remove a Student from a Classroom
export const removeStudentFromClassroom = asyncHandler(async (req, res) => {
  const { id, studentId } = req.params;
  const teacher = req.user._id;

  const classroom = await Classroom.findOne({ _id: id, teacher });

  if (!classroom) {
    throw new ApiError(404, "Classroom not found or unauthorized");
  }

  classroom.students.pull(studentId);
  await classroom.save();

  return res
    .status(200)
    .json(new ApiResponse(200, classroom, "Student removed from classroom successfully"));
});

// Get all Students in a Classroom
export const getStudentsInClassroom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teacher = req.user._id;

  const classroom = await Classroom.findOne({ _id: id, teacher }).populate("students", "-password");

  if (!classroom) {
    throw new ApiError(404, "Classroom not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, classroom.students, "Students retrieved successfully"));
});
