import * as mammoth from 'mammoth';
import { Question } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Institutional MCQ Parser Service
 * Extracts text from PDF/DOCX and prepares it for AI processing.
 */
export const parserService = {
  async extractTextFromFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    
    // 1. Handle DOCX
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch (err) {
        console.error("Mammoth error:", err);
        throw new Error("Failed to read Word document.");
      }
    }

    // 2. Handle PDF
    if (file.type === "application/pdf") {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str || "")
            .join(" ");
          fullText += pageText + "\n";
        }
        return fullText;
      } catch (err) {
        console.error("PDF.js error:", err);
        throw new Error("Failed to read PDF. Make sure it's not password protected.");
      }
    }

    throw new Error("Unsupported file format. Please upload PDF or DOCX.");
  },

  /**
   * Legacy regex-based parser (used as fallback or for immediate feedback)
   */
  parseMCQs(text: string): Partial<Question>[] {
    const cleanText = text.replace(/\r/g, "");
    const blocks = cleanText.split(/\n?\d+[\.\)]\s+/).filter(Boolean);
    const questions: Partial<Question>[] = [];

    for (const block of blocks) {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length < 3) continue;

      const questionText = lines[0];
      const optionLines = lines.filter(l => /^[A-D][\.\)]\s+/.test(l));
      
      if (optionLines.length < 2) continue;

      const options = optionLines.map(opt => opt.replace(/^[A-D][\.\)]\s+/, ""));
      const answerLine = lines.find(l => l.toLowerCase().includes("correct answer"));
      
      let correctIndex = 0;
      if (answerLine) {
        const match = answerLine.match(/[A-D]/i);
        if (match) {
          correctIndex = match[0].toUpperCase().charCodeAt(0) - 65;
        }
      }

      questions.push({
        text: questionText,
        options: options.slice(0, 4),
        correctAnswer: correctIndex,
        explanation: ""
      });
    }

    return questions;
  }
};