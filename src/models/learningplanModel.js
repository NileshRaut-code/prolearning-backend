import mongoose, { Schema } from "mongoose";

// Learning Plan Schema
const learningPlanSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recommendedTopics: [
      {
        topicId: {
          type: Schema.Types.ObjectId,
          ref: "Topic",
          required: true,
        },
        topicName: {
          type: String,
          required: true,
        },
        aiGeneratedQnA: [
          {
            question: { type: String, required: true },
            answer: { type: String, required: true },
            difficultyLevel: { type: String, enum: ["Easy", "Medium", "Hard"] },
            tags: [String],
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const LearningPlan = mongoose.model("LearningPlan", learningPlanSchema);
