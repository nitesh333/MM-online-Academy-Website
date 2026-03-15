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
      1. QUESTION PREFIXES: Recognize questions starting with "Q.", "Q1.", "Question:", or just numbers.
      2. MATH & EQUATIONS: Preserve mathematical notation like (2x + 7 = 19), x^2, √x, fractions, and complex equations exactly as they appear. Do not simplify them.
      3. IN-LINE HINTS: Look for checkmarks (✅), bold markers (**), or asterisks (*) inside the option text. These mark the correct answer.
      4. FOOTER KEYS: Look for lines like "Correct Answer: B", "Ans: c", or "Answer: 2" at the end of a question block.
      5. JAMMED/DENSE TEXT: If the text has NO newlines and questions/options are jammed together (e.g., "Solve: (2x+7=19)a) 6b) 5c) 7d) 8Correct Answer: bQ. Next Question..."), you MUST split them into separate question objects. Look for "Q." or "Correct Answer:" as markers for new questions.
      6. CASE SENSITIVITY: Handle both uppercase (A, B, C, D) and lowercase (a, b, c, d) labels.
      7. MULTILINE QUESTIONS: Some questions or options might span multiple lines. Group them correctly.

      OUTPUT SANITIZATION:
      - QUESTION TEXT: This field is MANDATORY. Preserve the full question statement. Do not remove prefixes like "Q." or "Solve:" if they are part of the question. Ensure equations like (2x + 7 = 19) are fully captured.
      - OPTIONS: Remove all labels (A., B., a), b), etc.) from the option strings.
      - FORMATTING: Remove ALL BOLDING (**) and symbols (✅) from the final strings.
      - CORRECT ANSWER: Map A/a=0, B/b=1, C/c=2, D/d=3 for the "correctAnswer" index.
      - Ensure exactly 4 options per question. If fewer are found, leave the remaining as empty strings.
      - If "Correct Answer" is given as a value (e.g. "Correct Answer: 5") and 5 is option 'b', set correctAnswer to 1.
      - If the correct answer is given as a letter (e.g. "Correct Answer: b"), map it to the correct index (0-3).

      ${rawText ? `TEXT TO PROCESS:\n${rawText.substring(0, 32000)}` : 'PROCESS THE ATTACHED IMAGE.'}`;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: { parts },
      config: {
        systemInstruction: "You are an expert academic document parser. Your goal is to extract MCQs from text or images. You MUST capture the full question statement, especially mathematical equations like (2x + 7 = 19). If the input text seems to have missing symbols (common in Word doc exports), use your knowledge of mathematics to reconstruct the logical question. Never return an empty 'text' field.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { 
                type: Type.STRING, 
                description: "The full MCQ question statement. This field is MANDATORY and MUST NOT be empty. Include any equations, prefixes like 'Q.' or 'Solve:', and the problem description." 
              },
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

/**
 * Humanizes AI-generated content to sound more natural and bypass AI detection.
 */
export const humanizeContent = async (content: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || !content) return content;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are an expert editor for Professional Academy (MM Online). 
      Your task is to rewrite the following content to make it sound 100% human, natural, and engaging.
      
      CRITICAL OBJECTIVES:
      1. BYPASS AI DETECTION: Use varied sentence structures, natural transitions, and a conversational yet professional tone.
      2. MAINTAIN FACTS: Do not change any dates, names, locations, or legal/academic facts.
      3. IMPROVE FLOW: Make the content easier to read and more compelling for students.
      4. REMOVE AI PATTERNS: Avoid repetitive "AI-like" phrases, overly formal listicles, or predictable paragraph structures.
      5. TONE: Professional, authoritative, yet approachable and encouraging for students.
      
      CONTENT TO HUMANIZE:
      ${content}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.9, // Higher temperature for more creative/human-like output
        topP: 0.95,
      }
    });

    return response.text || content;
  } catch (error) {
    console.error("Gemini Humanization Error:", error);
    return content;
  }
};

export const generateStudySummary = async () => "";
export const queryDocument = async () => "";
export const generateQuizFromTopic = async () => null;