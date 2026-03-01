import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

/**
 * Gemini-powered MCQ extraction service.
 */
export const parseQuizFromText = async (rawText: string): Promise<Partial<Question>[]> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key missing in environment.");
    return [];
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert academic parser for Professional Academy (MM Online). 
      Convert the following document text into a JSON array of MCQs.
      
      CRITICAL FORMAT RECOGNITION (SUPPORT ALL 3):
      1. IN-LINE HINTS: Look for checkmarks (✅), bold markers (**), or asterisks (*) inside the option text. These mark the correct answer.
      2. FOOTER KEYS: Look for lines like "Correct Answer: B" or "Ans: C" at the very end of a question block.
      3. DENSE TEXT: Options might be on the same line (e.g., A. Apple B. Banana). Split them into the array.

      OUTPUT SANITIZATION:
      - Remove all letters (A., B., etc.) from the option strings.
      - Remove ALL BOLDING (**) and symbols (✅) from the final strings.
      - Map A=0, B=1, C=2, D=3 for the "correctAnswer" index.
      - Ensure exactly 4 options per question.

      TEXT TO PROCESS:
      ${rawText.substring(0, 32000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The MCQ question statement" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4,
                description: "Array of exactly 4 strings"
              },
              correctAnswer: { type: Type.INTEGER, minimum: 0, maximum: 3, description: "Index of correct option" },
              explanation: { type: Type.STRING, description: "Optional explanation text" }
            },
            required: ["text", "options", "correctAnswer"]
          }
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) return [];

    const result = JSON.parse(textOutput);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return [];
  }
};

export const generateStudySummary = async () => "";
export const queryDocument = async () => "";
export const generateQuizFromTopic = async () => null;