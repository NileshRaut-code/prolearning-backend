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
    standard: {
      type:Number,
      required: true
    },
    subject: {
      type:String,
      required: true
    },
    questions: [
      {
        question:{
          type: String,
        },
        topicId:{
          type: String,
        },
        score:{
          type:Number
        }

      
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
