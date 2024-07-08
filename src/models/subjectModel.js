import mongoose, { Schema } from "mongoose";
const subjectSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      standard: {
        type: Schema.Types.ObjectId,
        ref: "Standard",
        required: true,
      },
      teacher: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      chapters: [
        {
          type: Schema.Types.ObjectId,
          ref: "Chapter",
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  
  export const Subject = mongoose.model("Subject", subjectSchema);
  