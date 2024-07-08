import mongoose ,{Schema} from "mongoose";

const reportSchema = new Schema(
    {
      student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      parent: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      scores: [
        {
          test: {
            type: Schema.Types.ObjectId,
            ref: "Test",
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
  
  export const Report = mongoose.model("Report", reportSchema);
  