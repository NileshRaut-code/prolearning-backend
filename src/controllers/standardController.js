import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Standard } from "../models/standardModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createStandard = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const standard = await Standard.create({ name, description });

  return res
    .status(201)
    .json(new ApiResponse(201, standard, "Standard created successfully"));
});

const getAllStandards = asyncHandler(async (req, res) => {
  const standards = await Standard.find({});

  return res
    .status(200)
    .json(new ApiResponse(200, standards, "Standards fetched successfully"));
});

const getStandardById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const standard = await Standard.findById(id).populate('subjects','name');

  if (!standard) {
    throw new ApiError(404, "Standard not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, standard, "Standard fetched successfully"));
});

const updateStandard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const standard = await Standard.findById(id);

  if (!standard) {
    throw new ApiError(404, "Standard not found");
  }

  standard.name = name || standard.name;
  standard.description = description || standard.description;

  const updatedStandard = await standard.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedStandard, "Standard updated successfully"));
});

const deleteStandard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const standard = await Standard.findById(id);

  if (!standard) {
    throw new ApiError(404, "Standard not found");
  }

  await standard.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Standard deleted successfully"));
});

export {
  createStandard,
  getAllStandards,
  getStandardById,
  updateStandard,
  deleteStandard,
};
