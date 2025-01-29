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
      standard: {
        type:Number,
      },

      RelatedTopic: [
        {
          type: Schema.Types.ObjectId,
          ref: "Topic",
        },
      ],
      AIRelatedTopic: [
        {
          title: { type: String, required: true },
          link: { type: String, required: true },
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
  
  topicSchema.index({ name: "text" ,description:"text"});


  export const Topic = mongoose.model("Topic", topicSchema);
  