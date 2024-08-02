import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Chapter } from "../models/chapterModel.js";
import { Subject } from "../models/subjectModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createChapter = asyncHandler(async (req, res) => {
  const { name, subjectId,teacherId } = req.body;

  if (!name || !subjectId || !teacherId) {
    throw new ApiError(400, "Name and subject-Id , teacherId are required");
  }

  const subject = await Subject.findById(subjectId);

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  const chapter = await Chapter.create({ name, subject: subjectId ,teacher:teacherId });
  subject.chapters.push(chapter._id);
  await subject.save();
  return res
    .status(201)
    .json(new ApiResponse(201, chapter, "Chapter created successfully"));
});



const getAllChapters = asyncHandler(async (req, res) => {
  const chapters = await Chapter.find({}).populate('subject','name');

  return res
    .status(200)
    .json(new ApiResponse(200, chapters, "Chapters fetched successfully"));
});

const getChapterById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chapter = await Chapter.findById(id).populate('subject','name').populate('topics','name')

  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chapter, "Chapter fetched successfully"));
});

const updateChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, subjectId } = req.body;

  const chapter = await Chapter.findById(id);

  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  if (subjectId) {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new ApiError(404, "Subject not found");
    }
    chapter.subject = subjectId;
  }

  chapter.name = name || chapter.name;

  const updatedChapter = await chapter.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedChapter, "Chapter updated successfully"));
});

const deleteChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chapter = await Chapter.findById(id);

  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  await chapter.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chapter deleted successfully"));
});

export {
  createChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
  

};
