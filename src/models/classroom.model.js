import mongoose, { Schema } from "mongoose";

const classroomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Classroom = mongoose.model("Classroom", classroomSchema);
