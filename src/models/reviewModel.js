import mongoose, { Mongoose, Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    topic_id: {
      type: String,
      require: true,
    },
    topic_comment: {
      type: String,
      require: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model("Review", reviewSchema);