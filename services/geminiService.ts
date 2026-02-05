import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// The API key is injected via Vite's define block and typed in env.d.ts
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseQuizFromText = async (questions: Partial<Question>[]): Promise<Partial<Question>[]> => {
  // Only process questions that don't have a valid correct answer index
  const needsSolving = questions.filter(q => q.correctAnswer === -1);
  if (needsSolving.length === 0) return questions;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert examiner. Solve the following multiple choice questions.
      For each question, identify the correct option index (0 for A, 1 for B, 2 for C, 3 for D).
      Return ONLY a JSON array of objects with "index" and "explanation".
      
      Questions:
      ${needsSolving.map((q, i) => `${i+1}. ${q.text}\nOptions: ${q.options?.join(', ')}`).join('\n\n')}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER, description: "Correct option index (0-3)" },
              explanation: { type: Type.STRING, description: "Brief legal/academic explanation" }
            },
            required: ["index", "explanation"]
          }
        }
      }
    });

    const solutions = JSON.parse(response.text || "[]");
    
    let solveIdx = 0;
    return questions.map(q => {
      if (q.correctAnswer === -1 && solutions[solveIdx]) {
        const sol = solutions[solveIdx++];
        return { ...q, correctAnswer: sol.index, explanation: sol.explanation };
      }
      return q;
    });
  } catch (error) {
    console.error("Gemini solving failed:", error);
    // Return original if AI fails
    return questions.map(q => q.correctAnswer === -1 ? { ...q, correctAnswer: 0 } : q);
  }
};

export const generateStudySummary = async () => "";
export const queryDocument = async () => "";
export const generateQuizFromTopic = async () => null;