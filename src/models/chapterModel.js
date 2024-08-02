import mongoose, { Schema } from "mongoose";

const chapterSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      subject: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },
      teacher: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      topics: [
        {
          type: Schema.Types.ObjectId,
          ref: "Topic",
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  
  export const Chapter = mongoose.model("Chapter", chapterSchema);
  