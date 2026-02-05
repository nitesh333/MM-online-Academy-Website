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
      // @ts-ignore - mammoth is loaded from CDN or local
      const mammoth = (window as any).mammoth || await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    // 2. Handle PDF
    if (file.type === "application/pdf") {
      // Import PDF.js dynamically to avoid build-time worker issues
      const pdfjsLib = await import('pdfjs-dist');
      
      // Configure worker for PDF.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // Join text items with spaces
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      return fullText;
    }

    throw new Error("Unsupported file format. Please upload PDF or DOCX.");
  },

  parseMCQs(text: string): Partial<Question>[] {
    // Normalize text: clean up spaces and standard line breaks
    text = text.replace(/\r/g, "").replace(/\n\s*\n/g, "\n");

    // Split questions by standard legal numbering (1. 2. 3.)
    const blocks = text.split(/\n?(?=\d+\.\s+)/).filter(Boolean);

    const questions: Partial<Question>[] = [];

    for (const block of blocks) {
      const lines = block
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

      if (lines.length < 3) continue;

      // Extract question (strip the "1. " part)
      const questionText = lines[0].replace(/^\d+\.\s+/, "");

      // Identify options A. B. C. D.
      const optionLines = lines.filter(l => /^[A-D]\.\s+/.test(l));
      if (optionLines.length < 2) continue;

      const options = optionLines.map(opt => opt.replace(/^[A-D]\.\s+/, ""));

      // Check for an explicit "Correct Answer" line in the text
      const answerLine = lines.find(l => l.toLowerCase().includes("correct answer"));
      let correctIndex: number | undefined = undefined;

      if (answerLine) {
        const match = answerLine.match(/[A-D]\)/i);
        if (match) {
          correctIndex = match[0][0].toUpperCase().charCodeAt(0) - 65;
        }
      }

      // Check for an explicit "Explanation" line
      const explanationLine = lines.find(l => l.toLowerCase().startsWith("explanation:"));
      const explanation = explanationLine
        ? explanationLine.replace(/^explanation:\s*/i, "").trim()
        : "";

      questions.push({
        text: questionText,
        options: options.slice(0, 4),
        // Use -1 to trigger Smart Analysis (Gemini) later if no answer found
        correctAnswer: (correctIndex !== undefined) ? correctIndex : -1,
        explanation: explanation
      });
    }

    return questions;
  }
};