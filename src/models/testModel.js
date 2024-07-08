import mongoose ,{Schema} from "mongoose";
const testSchema = new Schema(
    {
      topic: {
        type: Schema.Types.ObjectId,
        ref: "Topic",
        required: true,
      },
      questions: [
        {
          type: Schema.Types.ObjectId,
          ref: "Question",
        },
      ],
      results: [
        {
          student: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          score: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  
  export const Test = mongoose.model("Test", testSchema);
  