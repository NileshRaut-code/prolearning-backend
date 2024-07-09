import mongoose, { Schema } from "mongoose";
const standardSchema = new Schema(
    {
      name: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
      },
      subjects: [
        {
          type: Schema.Types.ObjectId,
          ref: "Subject",
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  
  export const Standard = mongoose.model("Standard", standardSchema);
  