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
      topic: {
        type: Schema.Types.ObjectId,
        ref: "Topic",
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );
  
  export const Question = mongoose.model("Question", questionSchema);
  