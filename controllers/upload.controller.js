import CustomError from "http-errors";

const uploadController = {
  uploadFiles: async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
      throw CustomError(400, "No files uploaded");
    }

    const processedFiles = [];

    files.forEach((file) => {
      if (file.mimeType !== "image/*" && file.mimeType !== "application/pdf") {
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

      let text;

      if (file.mimeType === "application/pdf") {
        // Handle Text Extraction using pdf-parse
        // IF no text found, useTesseract.js for OCR
        // UpdateText variable
      }

      if (file.mimeType === "image/*") {
        // Handle Text Extraction using Tesseract.js for OCR
        // UpdateText variable
      }

      // Match Regex Patterns to extract relevant Info from the text (using acquired token from req.body)

      // IF the Regex has a unknown match or confidence score < 0.8, use Gemini AI to extract the relevant information

      // Send information to Naming helper to get a structured file name

      // Upload file to AWS S3 using AWS SDK

      // Push the document to processedFiles array
    });

    // Use insertMany to add all processed files to MongoDB in one go

    // Return response with number of files uploaded and their details

    return res.status(200).json({ number: files.length, files });
  },
};

export default uploadController;
