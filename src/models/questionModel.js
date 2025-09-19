import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema(
    {
      questionText: {
        type: String,
        required: true,
      },
      options: [
        {
          type: String,
          required: true,
        },
      ],
      correctAnswer: {
        type: String,
        required: true,
      },
      difficultyLevel: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium",
      },
      score: {
        type: Number,
        default: 1,
      },
      explanation: {
        type: String,
      },
      tags: [
        {
          type: String,
        },
      ],
      topic: {
        type: Schema.Types.ObjectId,
        ref: "Topic",
      },
      topicId: {
        type: Schema.Types.ObjectId,
        ref: "Topic",
      },
    },
    {
      timestamps: true,
    }
  );
  
  export const Question = mongoose.model("Question", questionSchema);