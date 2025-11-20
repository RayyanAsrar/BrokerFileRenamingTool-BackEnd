import CustomError from "http-errors";
import { uploadSchema } from "../schemas/file.schema.js";
import * as S3Service from "../services/s3.service.js";
import validate from "../utils/validation.js";
import { generateFileNames } from "../services/gemini.service.js";
import File from "../models/file.model.js";
import { APIResponse } from "../utils/response.js";

const { uploadFile } = S3Service;

const uploadController = {
  uploadFiles: async (req, res) => {
    const { value, error } = validate(uploadSchema, req.body);

    if (error) {
      throw CustomError(400, error.details[0].message);
    }

    const files = req.files;

    console.log("Received Files:", files);
    if (!files || files.length === 0) {
      throw CustomError(400, "No files uploaded");
    }

    const processedFiles = [];

    // Upload files concurrently to AWS S3 using AWS SDK

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        // Check for initial file type and size constraints

        if (
          !file.mimetype.startsWith("image/") &&
          file.mimetype !== "application/pdf"
        ) {
          throw CustomError(
            400,
            `Unsupported file uploaded: ${file.originalname}`
          );
        }

        if (file.size > 5 * 1024 * 1024) {
          throw CustomError(
            400,
            `File size exceeds limit (5MB): ${file.originalname}`
          );
        }

        const fileData = {
          name: file.originalname,
          contentType: file.mimetype,
          body: file.buffer,
        };

        const { key } = await uploadFile(fileData);

        return {
          key,
          originalName: fileData.name,
          contentType: fileData.contentType,
          size: file.size,
          body: fileData.body,
        };
      })
    );

    const GeminiResponse = await generateFileNames(
      uploadedFiles,
      value.template,
      value.clientName,
      value.subClientName
    );

    const renamedFiles = JSON.parse(GeminiResponse);

    const fileDocuments = uploadedFiles.map((file) => {
      const renamedFile = renamedFiles.find(
        (rf) => rf.originalName === file.originalName
      );

      return {
        originalName: file.originalName,
        newName: renamedFile ? renamedFile.newName : file.originalName,
        size: file.size,
        contentType: file.contentType,
        key: file.key,
        confidenceScore: renamedFile ? renamedFile.confidence : null,
        status: renamedFile ? "processed" : "failed",
        review: renamedFile && renamedFile.confidence < 0.8,
        date: renamedFile ? renamedFile.date : null,
        issuer: renamedFile ? renamedFile.issuer : null,
        docType: renamedFile ? renamedFile.docType : null,
      };
    });

    const fileRecords = await File.insertMany(fileDocuments);

    return res
      .status(200)
      .json(new APIResponse("Files uploaded successfully", fileRecords));
  },
};

export default uploadController;
