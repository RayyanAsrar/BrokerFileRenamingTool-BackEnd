import CustomError from "http-errors";
import * as S3Service from "../services/s3.service.js";
import * as TextractService from "../services/textract.service.js";
import * as PDFExtractionService from "../services/pdfExtraction.service.js";

const { uploadFile } = S3Service;
const { processImage, processPdf } = TextractService;
const { parsePDF } = PDFExtractionService;

// TODO: Remove debug logs before production
// TODO: Request Body Validation for token and other params

const uploadController = {
  uploadFiles: async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
      throw CustomError(400, "No files uploaded");
    }

    const processedFiles = [];

    // Upload files concurrently to AWS S3 using AWS SDK

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        // Check for initial file type and size constraints

        console.log("Processing file:", file.originalname);

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

        console.log(`Uploaded file to S3: ${file.originalname} as ${key}`);

        return {
          key,
          originalName: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          body: file.buffer,
        };
      })
    );

    for (const file of uploadedFiles) {
      // Extract text from file using PDF-Parse

      let extractedText;

      if (file.contentType === "application/pdf") {
        extractedText = await parsePDF(file.body);

        console.log(`Extracted text from PDF: ${file.originalName}`);
      }

      // IF THERE IS NO TEXT, THEN AS FALLBACK GO FOR AWS TEXTRACT

      if (!extractedText || extractedText.trim().length === 0) {
        if (!file.contentType.startsWith("image/")) {
          extractedText = await processPdf(file.key);
          console.log(
            `Extracted text from PDF using Textract: ${file.originalName}`
          );
        }

        if (file.contentType.startsWith("image/")) {
          extractedText = await processImage(file.key);

          console.log(
            `Extracted text from Image using Textract: ${file.originalName}`
          );
        }
      }

      // Match Regex Patterns to extract relevant Info from the text (using acquired token from req.body)
      // IF the Regex has a unknown match or confidence score < 0.8, use Gemini AI to extract the relevant information
      // Send information to Naming helper to get a structured file name
      // Push the document to processedFiles array

      processedFiles.push({
        fileKey: file.key,
        originalName: file.originalName,
        contentType: file.contentType,
        size: file.size,
        extractedText,
      });

    }
    
    // Use insertMany to add all processed files to MongoDB in one go
    
    // Return response with number of files uploaded and their details

    console.log("Sending");

    return res
      .status(200)
      .json({ number: files.length, files: processedFiles });
  },
};

export default uploadController;
