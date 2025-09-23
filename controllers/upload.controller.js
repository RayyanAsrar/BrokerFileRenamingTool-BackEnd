import CustomError from "http-errors";
import * as S3Service from "../services/s3.service.js";
import * as TextractService from "../services/textract.service.js";

const { uploadFile } = S3Service;
const { processImage, processPdf } = TextractService;

// TODO: Remove debug logs before production
// TODO: Request Body Validation for token and other params

const uploadController = {
  uploadFiles: async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
      throw CustomError(400, "No files uploaded");
    }

    const processedFiles = [];

    for (const file of files) {
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

      // Upload file to AWS S3 using AWS SDK

      const fileData = {
        name: file.originalname,
        contentType: file.mimetype,
        body: file.buffer,
      };

      const { key } = await uploadFile(fileData);
      console.log(`File uploaded to S3 with key: ${key}`);

      // Small delay to ensure file is available in S3
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Extract text from file using AWS Textract using AWS SDK

      let extractedData;

      if (file.mimetype.startsWith("image/")) {
        extractedData = await processImage(key);
      }

      if (file.mimetype === "application/pdf") {
        extractedData = await processPdf(key);
      }

      // Match Regex Patterns to extract relevant Info from the text (using acquired token from req.body)

      // IF the Regex has a unknown match or confidence score < 0.8, use Gemini AI to extract the relevant information

      // Send information to Naming helper to get a structured file name

      // Push the document to processedFiles array

      const fileDoc = {
        originalName: file.originalname,
        size: file.size,
        contentType: file.mimetype,
        key: key,
        // NewName
        // Status
        // ConfidenceScore
        // Review
      };

      processedFiles.push(fileDoc);
    }

    // Use insertMany to add all processed files to MongoDB in one go

    // Return response with number of files uploaded and their details

    return res.status(200).json({ number: files.length, files });
  },
};

export default uploadController;
