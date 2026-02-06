
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
    // Always initialize with the direct environment variable as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract all MCQs from the following text and format them as a JSON array of objects. 
      Each object must have: 'text', 'options' (array of 4 strings), 'correctAnswer' (0-3 integer index), and 'explanation'.
      
      Text to parse:
      ${rawText.substring(0, 15000)}`, // Limit context window for performance
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
                description: "List of 4 answer choices"
              },
              correctAnswer: { 
                type: Type.INTEGER, 
                description: "0-based index of the correct option (0=A, 1=B, 2=C, 3=D)" 
              },
              explanation: { type: Type.STRING }
            },
            required: ["text", "options", "correctAnswer"]
          }
        }
      }
    });

    // Access the .text property directly as per guidelines
    const textOutput = response.text;
    if (!textOutput) return [];

    const result = JSON.parse(textOutput.trim());
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return [];
  }
};

export const generateStudySummary = async () => "";
export const queryDocument = async () => "";
export const generateQuizFromTopic = async () => null;
