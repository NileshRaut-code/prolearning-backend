import mongoose, { Schema } from "mongoose";

const physicalAnswerCopySchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    test: {
      type: Schema.Types.ObjectId,
      ref: "PhysicalTest",
      required: true,
    },
    pdfPath: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      default: "Not graded",
    },
    score: {
      type: Number,
      default: 0
    },
    recommendations: [
      {
        questionId:{
          type: String,
        },

        score:{
          type:Number
        },
        topicId:{
          type: String,
        }
       
      
      },
    ],
    feedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const PhysicalAnswerCopy = mongoose.model("PhysicalAnswerCopy", physicalAnswerCopySchema);
