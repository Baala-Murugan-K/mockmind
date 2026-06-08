import { createRequire } from 'module';
import Resume from '../models/Resume.model.js';

const require = createRequire(import.meta.url);
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

export const parseResumePDF = async (pdfBuffer) => {
  try {
    const uint8Array = new Uint8Array(
      pdfBuffer.buffer,
      pdfBuffer.byteOffset,
      pdfBuffer.byteLength
    );

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) throw new Error('Could not extract text from PDF. Is it a scanned image?');
    return fullText.trim();
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
};

export const saveResume = async (userId, fileName, extractedText) => {
  return Resume.findOneAndUpdate(
    { userId },
    { userId, fileName, extractedText },
    { upsert: true, new: true }
  );
};

export const getResumeByUserId = async (userId) => {
  return Resume.findOne({ userId });
};
