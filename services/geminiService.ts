
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

/**
 * Gemini-powered MCQ extraction service.
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
      contents: `You are an expert academic parser for Professional Academy. Convert the provided document text into a clean JSON array of MCQs.
      
      CRITICAL FORMAT RECOGNITION:
      1. IN-LINE HINTS: If you see "A. Choice ✅" or "**B. Choice**", that is the correct answer.
      2. FOOTER LETTER: If you see "Correct Answer: B" at the end of a question block, B is the correct answer.
      3. FOOTER TEXT: If you see "Correct Answer: B) text", B is the correct answer.
      4. DENSE TEXT: If options are jammed together (e.g. 4B. 7C. 9), split them correctly.

      OUTPUT SANITIZATION RULES:
      - The "text" and "options" strings MUST BE PLAIN TEXT.
      - REMOVE ALL BOLDING (**), checkmarks (✅), and option letters (A., B., etc.) from the final output strings.
      - Never leave hints in the options.

      SCHEMA:
      Map A=0, B=1, C=2, D=3. Always return 4 options.

      TEXT TO PROCESS:
      ${rawText.substring(0, 32000)}`,
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
