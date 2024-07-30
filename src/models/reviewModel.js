import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    topic_id: {
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
    replies: [
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
      }
    ],
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

export const Review = mongoose.model("Review", reviewSchema);
