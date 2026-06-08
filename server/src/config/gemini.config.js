import fetch from 'node-fetch';

const FREE_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'openai/gpt-oss-20b',
  'openrouter/free',
];

let workingModel = null;

export const generateContent = async (prompt) => {
  const modelsToTry = workingModel ? [workingModel, ...FREE_MODELS] : FREE_MODELS;

  for (const model of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a JSON-only response bot. Never include safety disclaimers, preamble, or explanation. Output raw JSON only.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.log(`Model ${model} failed: ${data.error?.message} — trying next...`);
        workingModel = null;
        continue;
      }

      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        console.log(`Model ${model} returned empty — trying next...`);
        workingModel = null;
        continue;
      }

      workingModel = model;
      console.log(`✓ Using model: ${model}`);
      return text;

    } catch (err) {
      console.log(`Model ${model} threw: ${err.message} — trying next...`);
      workingModel = null;
      continue;
    }
  }

  throw new Error('All AI models failed. Check your OPENROUTER_API_KEY.');
};