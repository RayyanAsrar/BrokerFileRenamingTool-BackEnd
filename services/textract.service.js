import {
  DetectDocumentTextCommand,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand,
} from "@aws-sdk/client-textract";
import env from "../config/env.js";
import textract from "../config/textract.js";

const { S3_BUCKET } = env;

function extractRawText(blocks) {
  return blocks
    .filter((b) => b.BlockType === "LINE" && b.Text)
    .map((b) => b.Text)
    .join("\n");
}

export async function processImage(key) {
  try {
    const command = new DetectDocumentTextCommand({
      Document: { S3Object: { Bucket: S3_BUCKET, Name: key } },
    });

    const resp = await textract.send(command);
    console.log("Textract Image Response:", JSON.stringify(resp, null, 2));
    console.log("Blocks count:", resp.Blocks?.length || 0);

    const extractedText = extractRawText(resp.Blocks);
    console.log("Extracted text from image:", extractedText);

    return extractedText;
  } catch (error) {
    console.error(`Error processing image ${key}:`, error);
    throw error;
  }
}

export async function processPdf(key) {
  try {
    const command = new StartDocumentTextDetectionCommand({
      DocumentLocation: { S3Object: { Bucket: S3_BUCKET, Name: key } },
    });

    const { JobId } = await textract.send(command);

    let status = "IN_PROGRESS";
    let blocks = [];
    while (status === "IN_PROGRESS") {
      await new Promise((r) => setTimeout(r, 3000));
      const resp = await textract.send(
        new GetDocumentTextDetectionCommand({ JobId })
      );
      status = resp.JobStatus;
      console.log("PDF processing status:", status);

      if (status === "SUCCEEDED") {
        blocks = resp.Blocks;
        console.log("Textract PDF Response:", JSON.stringify(resp, null, 2));
        console.log("Blocks count:", resp.Blocks?.length || 0);
        break;
      } else if (status === "FAILED") {
        throw new Error("Textract job failed");
      }
    }

    const extractedText = extractRawText(blocks);
    console.log("Extracted text from PDF:", extractedText);

    return extractedText;
  } catch (error) {
    console.error(`Error processing PDF ${key}:`, error);
    throw error;
  }
}
