
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

/**
 * Gemini-powered MCQ extraction service.
 * Converts raw text from documents into structured quiz objects.
 * This function MUST be exported to resolve TS2305 error in AdminPanel.
 */
export const parseQuizFromText = async (rawText: string): Promise<Partial<Question>[]> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing in environment.");
    return [];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract all MCQs from this text.
      The text may contain legal or academic content. 
      Ensure each question has exactly 4 options. 
      Infer the correct answer if not explicitly stated.
      
      Output ONLY as a JSON array of objects with:
      text: the question string
      options: array of 4 strings
      correctAnswer: index 0-3
      explanation: brief reason why it's correct
      
      TEXT:
      ${rawText.substring(0, 30000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4
              },
              correctAnswer: { type: Type.INTEGER, minimum: 0, maximum: 3 },
              explanation: { type: Type.STRING }
            },
            required: ["text", "options", "correctAnswer"]
          }
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) return [];

    const cleanJson = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJson);
    
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return [];
  }
};

export const generateStudySummary = async () => "";
export const queryDocument = async () => "";
export const generateQuizFromTopic = async () => null;
