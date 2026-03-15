
import * as mammoth from 'mammoth';
import { Question } from '../types';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';

// Align worker version with package.json (4.0.379)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs`;

/**
 * Scrub all formatting markers from text to prevent students from seeing "hints"
 */
const sanitizeText = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/\*\*/g, '') // Remove bolding
    .replace(/__/g, '')   // Remove underscores
    .replace(/[✅✔️☑️]/g, '') // Remove checkmarks
    .replace(/\s+/g, ' ') // Standardize whitespace
    .trim();
};

export const parserService = {
  async extractTextFromFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        // Use extractRawText for better stability with math-heavy docs
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch (err) {
        console.error("Word Read Error:", err);
        throw new Error("Failed to read Word document. Try saving as PDF or taking a screenshot.");
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
        if (!fullText || fullText.trim().length < 10) {
          throw new Error("This PDF appears to be a scanned document (images only). My system cannot read text from scanned PDFs directly. Please take a screenshot of the questions and upload the Image instead.");
        }
        return fullText;
      } catch (err: any) {
        console.error("PDF Read Error:", err);
        if (err.message.includes("scanned document")) throw err;
        throw new Error("Failed to read PDF. This can happen if the file is password-protected or corrupted. Try saving it as a new PDF or taking a screenshot of the questions.");
      }
    }
    if (file.type.startsWith("image/")) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }

    throw new Error("Unsupported file format. Please upload PDF, DOCX, or Image.");
  },

  parseMCQs(text: string): Partial<Question>[] {
    if (!text || text.trim().length < 10) return [];

    // 1. Structural Pre-processing: Un-jam text that has no newlines
    let processed = text
      .replace(/[^\S\r\n]+/g, " ") // Collapse horizontal whitespace
      .replace(/\r\n/g, "\n")      // Normalize newlines
      // Force newlines before options (a, b, c, d) if they are jammed (e.g. ")a) " or "8b) ")
      .replace(/([^\n])\s*([a-d][\)\.\-])\s+/gi, "$1\n$2 ")
      // Force newlines before Question markers (Q. or numbers) if jammed (e.g. "bQ. " or "8Q1. ")
      .replace(/([^\n])\s*(Q(?:uestion)?\s*\d*[\.\:\)])/gi, "$1\n$2")
      // Force newlines before Answer keys if jammed
      .replace(/([^\n])\s*(Correct\s+Answer|Ans|Key|Answer|Solution)[\s\.:\-\)]+/gi, "$1\n$2: ")
      .trim();
    
    // 2. Identify potential question starts
    // We look for Q1, Q.1, 1., (1), Question 1, etc.
    const splitRegex = /\n(?=Q(?:uestion)?\s*\d*[\.\:\)]|\d+[\.\)])/gi;
    let parts = processed.split(splitRegex);
    
    // If splitting by markers didn't yield much, try splitting by "Correct Answer" markers
    if (parts.length < 2) {
      const ansSplitRegex = /\n(?=Correct\s+Answer|Ans|Key|Answer|Solution)/gi;
      const ansParts = processed.split(ansSplitRegex);
      if (ansParts.length > 1) {
        // Re-group: each question block should end with an answer
        const blocks: string[] = [];
        let currentBlock = "";
        for (const p of ansParts) {
          currentBlock += p;
          if (/(?:Correct\s+Answer|Ans|Key|Answer|Solution)/i.test(p)) {
            blocks.push(currentBlock.trim());
            currentBlock = "";
          }
        }
        if (currentBlock) blocks.push(currentBlock.trim());
        parts = blocks;
      }
    }
    
    const blocks = parts.map(p => p.trim()).filter(p => p.length > 10);
    const questions: Partial<Question>[] = [];

    for (const block of blocks) {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      
      let questionText = "";
      let rawOptions: { text: string; isCorrect: boolean }[] = [];
      let footerDetectedIndex = -1;
      let optionsStarted = false;

      // Footer Answer Key Detection
      const footerMatch = block.match(/(?:Correct\s+Answer|Ans|Key|Answer|Solution)[\s\.:\-\)]+([A-D]|\d)(?:[\s\.\:\-\)]|$)/i);
      if (footerMatch) {
        const val = footerMatch[1].toUpperCase();
        if (/[A-D]/.test(val)) {
          footerDetectedIndex = val.charCodeAt(0) - 65;
        } else if (/\d/.test(val)) {
          footerDetectedIndex = parseInt(val) - 1; 
        }
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const optMatch = line.match(/^(?:\(?([A-D])[\.\)\-\:\s])\s*(.*)/i);
        
        if (optMatch) {
          optionsStarted = true;
          let optText = optMatch[2].trim();
          const isCorrect = /[✅✔️☑️]/.test(optText) || line.includes("**") || line.includes("*");
          rawOptions.push({ text: optText, isCorrect });
        } else if (!optionsStarted && !/^(?:Correct|Ans|Key|Explanation|Answer|Solution)/i.test(line)) {
          questionText += (questionText ? " " : "") + line;
        }
      }

      // If no options found by line splitting, try dense regex on the whole block
      if (rawOptions.length < 2) {
        const denseRegex = /(?:\(?([A-D])[\.\)\-\:\s])\s*([^A-D\n]+?)(?=\s+\(?([A-D])[\.\)\-\:\s]|$|\n)/gi;
        let match;
        while ((match = denseRegex.exec(block)) !== null) {
          const optText = match[2].trim();
          rawOptions.push({ text: optText, isCorrect: optText.includes("✅") || optText.includes("**") });
        }
      }

      if (rawOptions.length < 2) continue;

      questionText = questionText.replace(/^(?:Q(?:uestion)?\s*\d*[\.\:\)]|\d+[\.\)])\s*/i, "").trim();

      let finalCorrectAnswer = 0;
      if (footerDetectedIndex !== -1 && footerDetectedIndex >= 0 && footerDetectedIndex < rawOptions.length) {
        finalCorrectAnswer = footerDetectedIndex;
      } else {
        const hintIndex = rawOptions.findIndex(o => o.isCorrect);
        if (hintIndex !== -1) finalCorrectAnswer = hintIndex;
      }

      const sanitizedOptions = rawOptions.map(o => {
        const text = sanitizeText(o.text);
        return text.replace(/^[A-D][\.\)\s\-]+/i, '').trim();
      });
      
      while (sanitizedOptions.length < 4) {
        sanitizedOptions.push("");
      }
      
      const expMatch = block.match(/(?:Explanation|Reason|Sol|Solution|Exp|Note)[\s\.:\-\)]+([\s\S]+?)$/i);

      questions.push({
        text: sanitizeText(questionText) || "Untitled Question",
        options: sanitizedOptions.slice(0, 4),
        correctAnswer: finalCorrectAnswer,
        explanation: expMatch ? sanitizeText(expMatch[1]) : ""
      });
    }

    return questions;
  }
};
