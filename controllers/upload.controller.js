import CustomError from "http-errors";
import { uploadSchema } from "../schemas/file.schema.js";
import * as S3Service from "../services/s3.service.js";
import validate from "../utils/validation.js";

const { uploadFile } = S3Service;

const uploadController = {
  uploadFiles: async (req, res) => {
    const { value, error } = validate(uploadSchema, req.body);

    if (error) {
      throw CustomError(400, error.details[0].message);
    }

    const files = req.files;
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
          originalName: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          body: file.buffer,
        };
      })
    );

    
   
  },
};

export default uploadController;
