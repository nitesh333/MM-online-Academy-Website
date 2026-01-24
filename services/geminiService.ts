
import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudySummary = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a concise educational summary for the following topic: ${topic}. Focus on key legal or academic definitions suitable for a professional academy platform.`,
    });
    return response.text || "Could not generate summary at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Study assistant is currently unavailable.";
  }
};

export const generateQuizFromTopic = async (topic: string, subCategoryId: string): Promise<Quiz | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 5-question multiple choice quiz about "${topic}" in Pakistan legal/academic context. 
      Format the response as a JSON object matching the Quiz interface: 
      { "id": "generated_id", "title": "Topic Name", "subCategoryId": "${subCategoryId}", "questions": [ { "id": "q1", "text": "Question?", "options": ["A", "B", "C", "D"], "correctAnswer": 0 } ] }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER }
                },
                required: ["id", "text", "options", "correctAnswer"]
              }
            }
          },
          required: ["title", "questions"]
        }
      }
    });

    const quizData = JSON.parse(response.text || "{}");
    return {
      ...quizData,
      id: `ai_${Date.now()}`,
      subCategoryId
    };
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return null;
  }
};
