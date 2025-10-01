import pdf from "pdf-extraction";

export const parsePDF = async (fileBuffer) => {
  try {
    const data = await pdf(fileBuffer);

    if (!data.text.trim()) {
      return null; // No text found
    }

    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return null;
  }
};
