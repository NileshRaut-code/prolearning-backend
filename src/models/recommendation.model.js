import mongoose, { Schema } from "mongoose";

const recommendationSchema = new Schema({
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true
    },
    message: {
      type: String,
      required: true
    }
  }, { timestamps: true });
  
  export const Recommendation = mongoose.model("Recommendation", recommendationSchema);
  