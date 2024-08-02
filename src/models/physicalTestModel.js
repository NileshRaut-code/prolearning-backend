import mongoose, { Schema } from "mongoose";

const physicalTestSchema = new Schema(
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
    questions: [
      {
        type: String,
      },
    ],
    dueDate: {
      type: Date,
      
    },
    score:{
      type:Number,
      required:true
    }
  },
  {
    timestamps: true,
  }
);

export const PhysicalTest = mongoose.model("PhysicalTest", physicalTestSchema);
