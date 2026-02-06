
import * as mammoth from 'mammoth';
import { Question } from '../types';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs using a stable versioned CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

export const parserService = {
  async extractTextFromFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
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
          
          let lastY = -1;
          let pageLines: string[] = [];
          let currentLine = "";

          // Sort items by vertical position top-to-bottom, then left-to-right
          const items = (textContent.items as any[]).sort((a, b) => {
            const yDiff = b.transform[5] - a.transform[5];
            if (Math.abs(yDiff) > 5) return yDiff;
            return a.transform[4] - b.transform[4];
          });

          for (const item of items) {
            const y = item.transform[5];
            // If the y-coordinate significantly changes, it's a new line
            if (lastY !== -1 && Math.abs(y - lastY) > 8) {
              pageLines.push(currentLine.trim());
              currentLine = "";
            }
            currentLine += item.str + " ";
            lastY = y;
          }
          if (currentLine) pageLines.push(currentLine.trim());
          fullText += pageLines.join("\n") + "\n\n";
        }
        return fullText;
      } catch (err) {
        console.error("PDF Parsing Error:", err);
        throw new Error("Failed to read PDF.");
      }
    }

    throw new Error("Unsupported file format.");
  },

  parseMCQs(text: string): Partial<Question>[] {
    const cleanText = text.replace(/\r/g, "").trim();
    
    // Improved block splitter: looks for numbers followed by dots or parentheses at start of lines
    const blocks = cleanText.split(/(?:\n|^)\s*\d+[\.\)]\s+/).filter(Boolean);
    const questions: Partial<Question>[] = [];

    for (const block of blocks) {
      // Sometimes multiple options are on one line in OCR. 
      // We first normalize the block by putting common option labels on new lines
      const normalizedBlock = block.replace(/([A-D][\.\)])/g, "\n$1");
      const lines = normalizedBlock.split("\n").map(l => l.trim()).filter(Boolean);
      
      if (lines.length < 2) continue;

      let questionText = "";
      let options: string[] = [];
      let foundOption = false;

      for (const line of lines) {
        if (/^[A-D][\.\)]/i.test(line)) {
          foundOption = true;
          options.push(line.replace(/^[A-D][\.\)]\s*/i, "").trim());
        } else if (!foundOption) {
          questionText += (questionText ? " " : "") + line;
        }
      }

      if (options.length < 2) continue;

      // Handle correct answer detection (look for patterns like "Ans: A" or "Correct: B")
      const answerMatch = block.match(/(?:Ans|Correct|Answer)[:\s]+([A-D])/i);
      let correctAnswer = 0;
      if (answerMatch) {
        correctAnswer = answerMatch[1].toUpperCase().charCodeAt(0) - 65;
      }

      questions.push({
        text: questionText.trim(),
        options: options.slice(0, 4),
        correctAnswer,
        explanation: ""
      });
    }

    return questions;
  }
};
