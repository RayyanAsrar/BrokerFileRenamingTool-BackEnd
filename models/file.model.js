import { Schema, model } from "mongoose";

const fileSchema = new Schema(
  {
    originalName: { type: String, required: true },
    newName: { type: String, required: true },
    size: { type: Number, required: true },
    contentType: { type: String, required: true },
    key: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
    },
    confidenceScore: { type: Number, default: null },
    review: { type: Boolean, default: false },
    date: {type: String, default: null},
    issuer: {type: String, default: null},
    docType: {type: String, default: null},
    editedManually: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const File = model("File", fileSchema);

export default File;
