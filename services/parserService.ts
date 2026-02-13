
import * as mammoth from 'mammoth';
import { Question } from '../types';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';

// Use version 5.4.624 to match the index.html import
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs`;

/**
 * Scrub all formatting markers from text to prevent students from seeing "hints"
 */
const sanitizeText = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/\*\*/g, '') // Remove bolding
    .replace(/__/g, '')   // Remove underscores
    .replace(/[✅✔️☑️]/g, '') // Remove checkmarks
    .replace(/^[A-D][\.\)\s\-]+/i, '') // Remove leading A. or B) 
    .replace(/\s+/g, ' ') // Standardize whitespace
    .trim();
};

export const parserService = {
  async extractTextFromFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        return result.value.replace(/<p>/g, "\n")
                       .replace(/<\/p>/g, "\n")
                       .replace(/<br\s*\/?>/g, "\n")
                       .replace(/<[^>]+>/g, " ")
                       .replace(/&nbsp;/g, " ")
                       .replace(/&amp;/g, "&");
      } catch (err) {
        throw new Error("Failed to read Word document.");
      }
    }

    if (file.type === "application/pdf") {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n\n";
        }
        return fullText;
      } catch (err) {
        throw new Error("Failed to read PDF. Ensure the file is not corrupted.");
      }
    }
    throw new Error("Unsupported file format.");
  },

  parseMCQs(text: string): Partial<Question>[] {
    // 1. Structural Pre-processing
    // Force splits before markers to handle "jammed" text (e.g. "...textA. Option")
    let processed = text
      .replace(/\s+/g, " ") 
      .replace(/([^\n])\s+([A-D][\.\)])\s/gi, "$1\n$2 ") // Break jammed options
      .replace(/\s+(Correct\s+Answer:|Ans:|Answer:|Key:)/gi, "\n$1") // Break jammed footers
      .replace(/\s+(Q(?:uestion)?\s*\d*[\.\:]|\d+[\.\)])/gi, "\n$1") // Break jammed question starts
      .trim();
    
    // 2. Split into blocks based on question markers
    const blocks: string[] = [];
    // Split by newlines followed by a question marker
    const blockSplitter = /\n(?=Q(?:uestion)?\s*\d*[\.\:]|\d+[\.\)])/gi;
    const parts = processed.split(blockSplitter);
    
    for (const p of parts) {
      if (p.trim().length > 10) blocks.push(p.trim());
    }

    const questions: Partial<Question>[] = [];

    for (const block of blocks) {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      let questionText = lines[0].replace(/^(?:Q(?:uestion)?\s*\d*[\.\:]|\d+[\.\)])\s*/i, "");
      let rawOptions: { text: string; isCorrect: boolean }[] = [];
      let footerDetectedIndex = -1;

      // Extract footer letter (Handles Format 2 and 3)
      // Regex looks for "Correct Answer:" followed by A, B, C, or D
      const footerMatch = block.match(/(?:Correct\s+Answer|Ans|Key)[\s\.:\-\)]+([A-D])(?:[\s\.\:\-\)]|$)/i);
      if (footerMatch) {
        footerDetectedIndex = footerMatch[1].toUpperCase().charCodeAt(0) - 65;
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const optMatch = line.match(/^([A-D])[\.\)]\s*(.*)/i);
        
        if (optMatch) {
          let optText = optMatch[2].trim();
          // Detect hint markers (Format 1: ✅ or bolding)
          const isCorrect = /[✅✔️☑️]/.test(optText) || line.includes("**");
          rawOptions.push({ text: optText, isCorrect });
        } else if (rawOptions.length === 0 && !/^(?:Correct|Ans|Key|Explanation)/i.test(line)) {
          // Append to question text if we haven't hit options yet
          questionText += " " + line;
        }
      }

      // Validation: Must have at least 2 options
      if (rawOptions.length < 2) continue;

      // Resolve final correct answer (Priority: Footer > Inline Mark > Default A)
      let finalCorrectAnswer = 0;
      if (footerDetectedIndex !== -1 && footerDetectedIndex < rawOptions.length) {
        finalCorrectAnswer = footerDetectedIndex;
      } else {
        const hintIndex = rawOptions.findIndex(o => o.isCorrect);
        if (hintIndex !== -1) finalCorrectAnswer = hintIndex;
      }

      // Final sanitization and padding
      const sanitizedOptions = rawOptions.map(o => sanitizeText(o.text));
      while (sanitizedOptions.length < 4) sanitizedOptions.push("Option Placeholder");
      
      const expMatch = block.match(/(?:Explanation|Reason|Sol|Solution|Exp|Note)[\s\.:\-\)]+([\s\S]+?)$/i);

      questions.push({
        text: sanitizeText(questionText),
        options: sanitizedOptions.slice(0, 4),
        correctAnswer: finalCorrectAnswer,
        explanation: expMatch ? sanitizeText(expMatch[1]) : ""
      });
    }

    return questions;
  }
};
