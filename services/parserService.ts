
import * as mammoth from 'mammoth';
import { Question } from '../types';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';

// Synchronized worker version for stability
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@5.4.624/build/pdf.worker.mjs`;

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
        console.error("PDF Read Error:", err);
        throw new Error("Failed to read PDF. Ensure the file is valid and readable.");
      }
    }
    throw new Error("Unsupported file format.");
  },

  parseMCQs(text: string): Partial<Question>[] {
    // 1. Structural Pre-processing to handle dense text blocks
    let processed = text
      .replace(/\s+/g, " ") 
      // Force newlines before options that are jammed together (Format 3)
      .replace(/([^\n])\s+([A-D][\.\)\-\:\s])\s/gi, "$1\n$2 ")
      // Force newlines before answer keys (Format 2)
      .replace(/\s+(Correct\s+Answer:|Ans:|Answer:|Key:|Solution:|Explanation:)/gi, "\n$1")
      // Force newlines before question numbers
      .replace(/\s+(Q(?:uestion)?\s*\d*[\.\:]|\d+[\.\)])/gi, "\n$1")
      .trim();
    
    // Split into question blocks
    const blockSplitter = /\n(?=Q(?:uestion)?\s*\d*[\.\:]|\d+[\.\)])/gi;
    const parts = processed.split(blockSplitter);
    
    const blocks: string[] = parts.map(p => p.trim()).filter(p => p.length > 10);
    const questions: Partial<Question>[] = [];

    for (const block of blocks) {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      let questionText = lines[0].replace(/^(?:Q(?:uestion)?\s*\d*[\.\:]|\d+[\.\)])\s*/i, "");
      let rawOptions: { text: string; isCorrect: boolean }[] = [];
      let footerDetectedIndex = -1;

      // FORMAT 2: Footer Answer Key Detection
      const footerMatch = block.match(/(?:Correct\s+Answer|Ans|Key|Answer)[\s\.:\-\)]+([A-D])(?:[\s\.\:\-\)]|$)/i);
      if (footerMatch) {
        footerDetectedIndex = footerMatch[1].toUpperCase().charCodeAt(0) - 65;
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Match A. A) (A) A- etc.
        const optMatch = line.match(/^(?:\(?([A-D])[\.\)\-\:\s])\s*(.*)/i);
        
        if (optMatch) {
          let optText = optMatch[2].trim();
          // FORMAT 1: Inline Hint Detection
          const isCorrect = /[✅✔️☑️]/.test(optText) || line.includes("**") || line.includes("*");
          rawOptions.push({ text: optText, isCorrect });
        } else if (rawOptions.length === 0 && !/^(?:Correct|Ans|Key|Explanation|Answer|Solution)/i.test(line)) {
          questionText += " " + line;
        }
      }

      // FORMAT 3: DENSE FALLBACK (If simple splitting failed)
      if (rawOptions.length < 2) {
        const denseRegex = /(?:\(?([A-D])[\.\)\-\:\s])\s*([^A-D\n]+?)(?=\s+\(?([A-D])[\.\)\-\:\s]|$|\n)/gi;
        let match;
        while ((match = denseRegex.exec(block)) !== null) {
          const optText = match[2].trim();
          rawOptions.push({ text: optText, isCorrect: optText.includes("✅") || optText.includes("**") });
        }
      }

      if (rawOptions.length < 2) continue;

      // Priority: Footer Key > Inline Hint > Default 0
      let finalCorrectAnswer = 0;
      if (footerDetectedIndex !== -1 && footerDetectedIndex < rawOptions.length) {
        finalCorrectAnswer = footerDetectedIndex;
      } else {
        const hintIndex = rawOptions.findIndex(o => o.isCorrect);
        if (hintIndex !== -1) finalCorrectAnswer = hintIndex;
      }

      const sanitizedOptions = rawOptions.map(o => sanitizeText(o.text));
      while (sanitizedOptions.length < 4) sanitizedOptions.push(`Placeholder Option ${sanitizedOptions.length + 1}`);
      
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
