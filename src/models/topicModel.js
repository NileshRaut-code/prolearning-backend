import mongoose, { Schema } from "mongoose";

const topicSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
      },
      description: {
        type: String,
        required: true,
      },
      chapter: {
        type: Schema.Types.ObjectId,
        ref: "Chapter",
        required: true,
      },
      RelatedTopic: [
        {
          type: Schema.Types.ObjectId,
          ref: "Topic",
        },
      ],
      questions: [
        {
          type: Schema.Types.ObjectId,
          ref: "Question",
        },
      ],
      test: {
        type: Schema.Types.ObjectId,
        ref: "Test",
      },
      topic_level: {
        type: String,
        enum: ["EASY", "MEDIUM", "HARD"],
      },
    },
    {
      timestamps: true,
    }
  );
  
  export const Topic = mongoose.model("Topic", topicSchema);
  