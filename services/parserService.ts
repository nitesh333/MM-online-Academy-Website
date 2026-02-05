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
      // @ts-ignore - mammoth is loaded from CDN
      const mammoth = window.mammoth;
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    // 2. Handle PDF
    if (file.type === "application/pdf") {
      // @ts-ignore - pdfjsLib is loaded from CDN
      const pdfjsLib = window['pdfjsLib'] || await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs');
      
      // Ensure worker is set up
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
      }
      
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
    // Normalize text: remove line breaks that split sentences unnecessarily
    text = text.replace(/\r/g, "").replace(/\n\s*\n/g, "\n");

    // Split questions by standard numbering (1. 2. 3.) at start of lines or preceded by newline
    // This regex looks for a digit followed by a dot at the start of a logical block
    const blocks = text.split(/\n?(?=\d+\.\s+)/).filter(Boolean);

    const questions: Partial<Question>[] = [];

    for (const block of blocks) {
      const lines = block
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

      if (lines.length < 3) continue;

      // Extract question (strip the 1. part)
      const questionTitle = lines[0].replace(/^\d+\.\s+/, "");

      // Find options: A. B. C. D.
      const optionLines = lines.filter(l => /^[A-D]\.\s+/.test(l));
      
      // If we don't find enough options in the lines, the block might be formatted differently
      if (optionLines.length < 2) continue;

      const options = optionLines.map(opt => opt.replace(/^[A-D]\.\s+/, ""));

      // Correct Answer line check (e.g. Correct Answer: A) )
      const answerLine = lines.find(l => l.toLowerCase().includes("correct answer"));
      let correctIndex: number | undefined = undefined;

      if (answerLine) {
        const match = answerLine.match(/[A-D]\)/i);
        if (match) {
          correctIndex = match[0][0].toUpperCase().charCodeAt(0) - 65;
        }
      }

      // Explanation extraction
      const explanationLine = lines.find(l => l.toLowerCase().startsWith("explanation:"));
      const explanation = explanationLine
        ? explanationLine.replace(/^explanation:\s*/i, "").trim()
        : "";

      questions.push({
        text: questionTitle,
        options: options.slice(0, 4),
        correctAnswer: correctIndex ?? -1, // -1 means we need AI to solve it
        explanation: explanation
      });
    }

    return questions;
  }
};