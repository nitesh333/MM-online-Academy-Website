
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

/**
 * Gemini-powered MCQ extraction service.
 * Converts raw text from documents into structured quiz objects.
 */
export const parseQuizFromText = async (rawText: string): Promise<Partial<Question>[]> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing in environment.");
    return [];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Improved prompt to focus on finding the CORRECT answers specifically
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract all MCQs from the provided text. 
      
      IMPORTANT: 
      1. Look for an answer key at the end of the text or specific markers like "Ans:", "Correct:", or "(*)".
      2. If an answer is explicitly given in the text, use it. 
      3. If no answer is given, use your legal/academic knowledge to determine the most accurate answer.
      4. Each question MUST have 4 options. 
      5. Provide a brief explanation for the correct answer.

      Output ONLY as a JSON array.
      
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
              correctAnswer: { 
                type: Type.INTEGER, 
                description: "Index (0-3) of the correct option",
                minimum: 0, 
                maximum: 3 
              },
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
