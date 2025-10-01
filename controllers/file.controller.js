import * as S3Service from "../services/s3.service.js";
import CustomError from "http-errors";
import validate from "../utils/validation.js";
import { renameSchema, downloadSchema } from "../schemas/file.schema.js";
import File from "../models/file.model.js";
import { APIResponse } from "../utils/response.js"; 
import archiver from "archiver";

const fileController = {
  renameFile: async (req, res) => {
    const { fileID } = req.params;

    const { value, error } = validate(renameSchema, req.body);
    if (error) throw CustomError(400, error.details[0].message);

    const { newName } = value;

    const updatedFile = await File.findByIdAndUpdate(
      fileID,
      { newName },
      { new: true }
    );

    if (!updatedFile) throw CustomError(404, "File not found");

    return res
      .status(200)
      .json(new APIResponse("File renamed successfully", updatedFile));
  },

  downloadFiles: async (req, res) => {
    const { value, error } = validate(downloadSchema, req.body);
    if (error) throw CustomError(400, error.details[0].message);

    const { files } = value;

    const fileRecords = await File.find({ _id: { $in: files } });
    if (fileRecords.length === 0) throw CustomError(404, "No files found");

    // Create archive
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=documents.zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    // Stream files from S3 into the ZIP
    for (const record of fileRecords) {
      if (!record.key) continue; // skip files with no S3 key

      const fileStream = await S3Service.getFileStream(record.key);
      archive.append(fileStream, {
        name: record.newName || record.originalName,
      });
    }

    archive.finalize();

    // After download completes, clean up
    archive.on("end", async () => {
      // Delete DB records
      const deleteResult = await File.deleteMany({ _id: { $in: files } });

      // Bulk delete from S3
      const keys = fileRecords.map((rec) => rec.key).filter(Boolean);
      if (keys.length > 0) {
        await S3Service.deleteFiles(keys);
      }
    });
  },
};

export default fileController;
