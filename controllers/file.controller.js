import CustomError from "http-errors";
import validate from "../utils/validation.js";
import { renameSchema } from "../schemas/upload.schema.js";
import File from "../models/file.model.js";
import { APIResponse } from "../utils/response.js";

const fileController = {
  renameFile: async (req, res) => {
    const { fileID } = req.params;

    const { value, error } = validate(renameSchema, req.body);

    if (error) {
      throw CustomError(400, error.details[0].message);
    }

    const { newName, oldName } = value;

    const newFile = await File.findByIdAndUpdate(
      fileID,
      { newName },
      { new: true }
    );

    if (!newFile) {
      throw CustomError(404, "File not found");
    }

    return res
      .status(200)
      .json(new APIResponse("File renamed successfully", newFile));
  },
};

export default fileController;
