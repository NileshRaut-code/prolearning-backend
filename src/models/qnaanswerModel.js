import mongoose, { Schema } from "mongoose";

const qnaAnswerSchema = new Schema(
    {
     Questionid:{
        type: Schema.Types.ObjectId,
        ref: "Qna",
     },
     answer:{
      type:String
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
  
  export const Qnaanswer = mongoose.model("Qnaanswer", qnaAnswerSchema);
  