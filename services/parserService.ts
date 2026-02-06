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
    text = text.replace(/\r/g, "");

    // Split questions by number (1., 2., 3.)
    const blocks = text.split(/\n?\d+\.\s+/).filter(Boolean);

    const questions: Partial<Question>[] = [];

    for (const block of blocks) {
      const lines = block
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

      // Question text usually starts at the beginning of the block
      if (lines.length < 5) continue;

      const questionTitle = lines[0];

      // Options: A. B. C. D.
      const optionLines = lines.filter(l =>
        /^[A-D]\.\s+/.test(l)
      );

      // Require at least some options to proceed
      if (optionLines.length < 2) continue;

      const options = optionLines.map(opt =>
        opt.replace(/^[A-D]\.\s+/, "")
      );

      // Correct Answer line check
      const answerLine = lines.find(l =>
        l.includes("Correct Answer")
      );

      let correctIndex = 0;
      if (answerLine) {
        // Extract correct option letter followed by ) like A)
        const match = answerLine.match(/[A-D]\)/);
        if (match) {
          correctIndex = match[0][0].toUpperCase().charCodeAt(0) - 65;
        }
      }

      // Explanation extraction
      const explanationLine = lines.find(l =>
        l.startsWith("Explanation:")
      );
      const explanation = explanationLine
        ? explanationLine.replace("Explanation:", "").trim()
        : "";

      questions.push({
        text: questionTitle,
        options: options.slice(0, 4),
        correctAnswer: correctIndex,
        explanation: explanation
      });
    }

    return questions;
  }
};