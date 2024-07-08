import mongoose, { Schema } from "mongoose";

const qnaSchema = new Schema(
    {
     title:{
        type:String
     },
     answer:{
      type: Schema.Types.ObjectId,
        ref: "Answer",
     },
     user:{
      type: Schema.Types.ObjectId,
      ref: "User",
     }
    },
    {
      timestamps: true,
    }
  );
  
  export const Qna = mongoose.model("Qna", topicSchema);
  