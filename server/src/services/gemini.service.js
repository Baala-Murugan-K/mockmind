import { generateContent } from '../config/gemini.config.js';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export const askGemini = async (prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await generateContent(prompt);
      if (!response) throw new Error('AI returned empty response');
      return response;
    } catch (error) {
      const is429 = error.message.includes('429') || error.message.includes('rate');
      if (is429 && i < retries - 1) {
        const wait = (i + 1) * 15000;
        console.log(`Rate limited. Retrying in ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      throw new Error(`AI service error: ${error.message}`);
    }
  }
};