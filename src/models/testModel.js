import mongoose ,{Schema} from "mongoose";
const testSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      topic: {
        type: Schema.Types.ObjectId,
        ref: "Topic",
      },
      timeLimit: {
        type: Number, // in minutes
        default: 60,
      },
      instructions: {
        type: String,
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      questions: [
        {
          type: Schema.Types.ObjectId,
          ref: "Question",
        },
      ],
      results: [
        {
          student: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          score: {
            type: Number,
            required: true,
          },
          correctAnswers: {
            type: Number,
            default: 0,
          },
          totalQuestions: {
            type: Number,
            default: 0,
          },
          timeSpent: {
            type: Number, // in seconds
            default: 0,
          },
          detailedResults: [
            {
              questionId: {
                type: Schema.Types.ObjectId,
                ref: "Question",
              },
              selectedAnswer: String,
              correctAnswer: String,
              isCorrect: Boolean,
              score: Number,
            },
          ],
          submittedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  
  export const Test = mongoose.model("Test", testSchema);
  