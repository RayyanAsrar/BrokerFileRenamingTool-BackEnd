import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import env from "../config/env.js";

const { GEMINI_API_KEY } = env;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "How does AI work?",
    config: {
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    },
  });
  console.log(response.text);
}
