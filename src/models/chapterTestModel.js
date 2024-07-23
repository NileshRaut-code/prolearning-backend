
import mongoose, { Schema } from "mongoose";

const chapterTestSchema = new Schema({
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true
    },
    standard: {
      type:Number,
      required: true
    },
    subject: {
      type:String,
      required: true
    },
    testName: {
      type: String,
      required: true
    },
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    }]
  }, { timestamps: true });
  
  export const ChapterTest = mongoose.model("ChapterTest", chapterTestSchema);
  