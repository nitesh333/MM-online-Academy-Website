import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

/**
 * Gemini-powered MCQ extraction service.
 */
export const parseQuizFromText = async (rawText: string, imageBase64?: string): Promise<Partial<Question>[]> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key missing in environment.");
    return [];
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const parts: any[] = [];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          data: imageBase64.split(',')[1] || imageBase64,
          mimeType: "image/png"
        }
      });
    }

    const prompt = `You are an expert academic parser for Professional Academy (MM Online). 
      Convert the following ${imageBase64 ? 'image' : 'document text'} into a JSON array of MCQs.
      
      CRITICAL FORMAT RECOGNITION (SUPPORT ALL VARIANTS):
      1. IN-LINE HINTS: Look for checkmarks (✅), bold markers (**), or asterisks (*) inside the option text. These mark the correct answer.
      2. FOOTER KEYS: Look for lines like "Correct Answer: B", "Ans: c", or "Answer: 2" at the end of a question block.
      3. DENSE TEXT: Options might be on the same line (e.g., a) Apple b) Banana). Split them into the array.
      4. MATH SYMBOLS: Preserve mathematical notation like x^2, √x, fractions, and equations exactly as they appear.
      5. CASE SENSITIVITY: Handle both uppercase (A, B, C, D) and lowercase (a, b, c, d) labels.

      OUTPUT SANITIZATION:
      - Remove all labels (A., B., a), b), etc.) from the option strings.
      - Remove ALL BOLDING (**) and symbols (✅) from the final strings.
      - Map A/a=0, B/b=1, C/c=2, D/d=3 for the "correctAnswer" index.
      - Ensure exactly 4 options per question. If fewer are found, leave the remaining as empty strings.
      - If "Correct Answer" is given as a value (e.g. "Correct Answer: 5") and 5 is option 'b', set correctAnswer to 1.

      ${rawText ? `TEXT TO PROCESS:\n${rawText.substring(0, 32000)}` : 'PROCESS THE ATTACHED IMAGE.'}`;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
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