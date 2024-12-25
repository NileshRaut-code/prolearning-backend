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
          type:String,
        },

        difficultyLevel:{
          type: String,
          default:"Easy"
        },
        tag:{
          type:String
        },
        score:{
          type:Number,
          default:1
        }

      
      },
    ],
    dueDate: {
      type: Date,

    },
    score:{
      type:Number,
      required:true
    },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
    },
  },
  {
    timestamps: true,
  }
);

export const PhysicalTest = mongoose.model("PhysicalTest", physicalTestSchema);
