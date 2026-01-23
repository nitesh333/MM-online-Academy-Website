
import { GoogleGenAI } from "@google/genai";

export const generateStudySummary = async (topic: string): Promise<string> => {
  // Fixed: Initializing GoogleGenAI with the API key directly from process.env as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a concise educational summary for the following topic: ${topic}. Focus on key legal or academic definitions suitable for a professional academy platform.`,
    });
    // Accessing .text property as per guidelines
    return response.text || "Could not generate summary at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Study assistant is currently unavailable.";
  }
};
