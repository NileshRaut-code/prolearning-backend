import mongoose, { Schema } from "mongoose";

const chapterTestResultSchema = new Schema({
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChapterTest",
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    score: {
      type: Number,
      
    },
    recommendations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recommendation"
    }]
  }, { timestamps: true });
  
  export const ChapterTestResult = mongoose.model("ChapterTestResult", chapterTestResultSchema);
  