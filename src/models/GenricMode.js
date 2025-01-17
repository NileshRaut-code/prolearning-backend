import mongoose, { Schema } from "mongoose";

// Generic Plan Schema
const genericLearningPlanSchema = new Schema(
  {
    standard: {
      type: Number,
      required: true,
      unique: true, // One plan per standard
    },
    topicsPriority: [
      {
        topicId: {
          type: Schema.Types.ObjectId,
          ref: "Topic",
          required: true,
        },
        priorityLevel: {
          type: String,
          enum: ["High", "Medium", "Low"],
          required: true,
        },
        reasoning: String, // Why this topic is prioritized
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Typically an admin or system-generated
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active", // Can be marked as inactive if needed
    },
  },
  { timestamps: true }
);

export const GenericLearningPlan = mongoose.model("GenericLearningPlan", genericLearningPlanSchema);
