import { Question } from "../types";

/**
 * AI services have been disabled to ensure compatibility without an API Key.
 * Standard parsing logic in parserService.ts handles the bulk of the work.
 */

export const parseQuizFromText = async (questions: Partial<Question>[]): Promise<Partial<Question>[]> => {
  // Simply return the questions as parsed by the document service.
  // If an answer is missing (-1), the admin can set it manually in the UI.
  return questions.map(q => ({
    ...q,
    correctAnswer: q.correctAnswer === undefined ? -1 : q.correctAnswer,
    explanation: q.explanation || ""
  }));
};

export const generateStudySummary = async () => "";
export const queryDocument = async () => "";
export const generateQuizFromTopic = async () => null;