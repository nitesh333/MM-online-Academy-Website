import * as mammoth from 'mammoth';
import { Question } from '../types';

/**
 * Institutional MCQ Parser Service
 * Extracts text from PDF/DOCX and converts to structured Quiz data.
 */

export const parserService = {
  async extractTextFromFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    
    // 1. Handle DOCX
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    // 2. Handle PDF
    if (file.type === "application/pdf") {
      // @ts-ignore - pdfjsLib is loaded from CDN in index.html
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs';
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      return fullText;
    }

    throw new Error("Unsupported file format. Please upload PDF or DOCX.");
  },

  parseMCQs(text: string): Partial<Question>[] {
    // Normalize text
    text = text.replace(/\r/g, "");

    // Split questions based on common patterns: Q1., Q 1., 1. 
    // This regex looks for a digit followed by a period or parenthesis at the start of a line
    const blocks = text.split(/\n(?=Q?\d+[\.\)])/).filter(Boolean);
    const questions: Partial<Question>[] = [];

    for (const block of blocks) {
      const lines = block
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

      if (lines.length < 5) continue;

      const questionText = lines[0].replace(/^Q?\d+[\.\)]\s*/, "");

      // Identify options A, B, C, D
      const optionLines = lines.filter(l => /^[A-D][\).\)]/i.test(l));
      if (optionLines.length < 2) continue;

      const options = optionLines.map(opt => opt.replace(/^[A-D][\).\)]\s*/i, ""));

      // Find answer key
      const answerLine = lines.find(l => l.toLowerCase().includes("answer"));
      let correctIndex = 0;

      if (answerLine) {
        const match = answerLine.match(/[A-D]/i);
        if (match) {
          correctIndex = match[0].toUpperCase().charCodeAt(0) - 65;
        }
      }

      questions.push({
        text: questionText,
        options: options.slice(0, 4), // Ensure only 4 options
        correctAnswer: correctIndex >= 0 && correctIndex < options.length ? correctIndex : 0
      });
    }

    return questions;
  }
};