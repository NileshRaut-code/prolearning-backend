import mongoose, { Schema } from "mongoose";

const replySchema = new Schema(
  {
    replies_id: {
      type: String,
      required: true,
    },
    topic_comment: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      }
    ]
  },
  {
    timestamps: true,
  }
);

const reviewSchema = new Schema(
  {
    title: {
      type: String,
    },
    topic_id: {
      type: String,
      required: true,
    },
    topic_comment: {
      type: String,
      required: true,
    },
   
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    replies: [replySchema],
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      }
    ]
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ title: "text", topic_comment: "text" });


export const Review = mongoose.model("Review", reviewSchema);
