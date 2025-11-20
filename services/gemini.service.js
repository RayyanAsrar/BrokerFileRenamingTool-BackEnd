import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import env from "../config/env.js";

const { GEMINI_API_KEY } = env;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const model = "gemini-2.5-flash";

async function fileProcessor(file) {
  // File Buffer is in file.body
  const displayName = file.originalName;
  const fileType = file.contentType;

  const fileBlob = new Blob([file.body], { type: fileType });

  const geminiFile = await ai.files.upload({
    file: fileBlob,
    config: {
      displayName,
    },
  });

  // Wait for the file to be processed.
  let getFile = await ai.files.get({ name: geminiFile.name });

  console.log(`Initial file status: ${getFile.displayName}`);

  while (getFile.state === "PROCESSING") {
    getFile = await ai.files.get({ name: geminiFile.displayName });
    console.log(`current file status: ${getFile.state}`);
    console.log("File is still processing, retrying in 5 seconds");

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  }
  if (getFile.state === "FAILED") {
    throw new Error("File processing failed.");
  }

  return getFile;
}

export async function generateFileNames(
  files,
  template,
  clientName,
  subClientName = ""
) {
  const contents = [
    "You are an intelligent document naming assistant specialized in renaming files according to specific naming conventions and templates.",
    "",
    "## Task:",
    "Analyze each document and generate a new, descriptive file name that follows the provided template and naming convention.",
    "",
    "## Naming Template:",
    `${template}`,
    "",
    "## Client Information:",
    `- Client Name: ${clientName}`,
    `- Sub Client Name: ${subClientName || "N/A"}`,
    "",
    "## Instructions:",
    "1. Carefully examine the content of each document",
    "2. Extract relevant information such as document type, dates, policy numbers, account numbers, or any identifying information",
    "3. Generate a new file name that follows the template structure and includes the extracted information",
    "4. Use the client name and sub-client name appropriately in the file name",
    "5. Ensure file names are professional, clear, and follow standard naming conventions (no special characters except underscore and hyphen)",
    "6. Keep the original file extension",
    "",
    "## Critical Requirements:",
    "- The newName MUST be different from the originalName",
    "- DO NOT return the original file name as the new name under any circumstances",
    "- If you cannot extract meaningful information, add Unknown in the space of that token.",
    "- If there is a space between the found data, remove the space between. For Example if the issuer is 'Bank of America', make it 'BankofAmerica' in the new name.",
    "- Reduce the confidenceScore of the name by 0.1 for each instance of 'Unknown' in the new name.",
    "Check to match the provided client name exactly; if it does not match, make it unknown.",
    "- Make sure the confidence score reflects your certainty about the accuracy of the extracted information and the appropriateness of the new name.",
    "",
    "## Output Format:",
    "Return ONLY a valid JavaScript array of objects with this exact structure:",
    '[{"originalName": "original_filename.pdf", "newName": "relevant to the template", confidence: "The accuracy of the correctness of the new name", issuer: "extracted issuer name", date: "extracted date", docType: "evaluated type of the document"}, ...]',
    "",
    "- Do NOT include any markdown formatting, code blocks, or explanatory text",
    "- Do NOT wrap the response in ```json or ```javascript",
    "- Return only the raw array",
    "- Make the confidence score a decimal between 0 and 1 indicating your confidence in the accuracy of the new name",

    `files are ${JSON.stringify(files.map((f) => f.originalName))}`,
  ];

  const processedFiles = await Promise.all(
    files.map(async (file) => {
      const processedFile = await fileProcessor(file);
      const fileContent = createPartFromUri(
        processedFile.uri,
        processedFile.mimeType
      );
      contents.push(fileContent);
      return processedFile;
    })
  );

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      temperature: 0.7,
    },
  });

  return response.candidates[0].content.parts[0].text;
}
