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
            difficultyLevel: { type: String, enum: ["Easy", "Medium", "Hard"] },
            tags: [String],
          },
        ],
        isCompleted: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedTopicsCount: {
      type: Number,
      default: 0,
    },
    totalTopicsCount: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate progress
learningPlanSchema.pre('save', function(next) {
  if (this.recommendedTopics && this.recommendedTopics.length > 0) {
    this.totalTopicsCount = this.recommendedTopics.length;
    this.completedTopicsCount = this.recommendedTopics.filter(topic => topic.isCompleted).length;
    this.overallProgress = Math.round((this.completedTopicsCount / this.totalTopicsCount) * 100);
    
    // Update status based on progress
    if (this.overallProgress === 0) {
      this.status = "Pending";
    } else if (this.overallProgress === 100) {
      this.status = "Completed";
      if (!this.completedAt) {
        this.completedAt = new Date();
      }
    } else {
      this.status = "In Progress";
    }
  }
  next();
});

export const LearningPlan = mongoose.model("LearningPlan", learningPlanSchema);
