import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const transcribeAudio = async (audioBuffer, originalName) => {
  const extension = path.extname(originalName) || '.webm';
  const tmpPath = path.join(os.tmpdir(), `audio-${Date.now()}${extension}`);

  try {
    fs.writeFileSync(tmpPath, audioBuffer);
    const base64Audio = fs.readFileSync(tmpPath).toString('base64');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Transcribe this audio exactly. Return only the transcribed text, nothing else.',
              },
              {
                type: 'input_audio',
                input_audio: {
                  data: base64Audio,
                  format: extension.replace('.', '') || 'webm',
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data.error));
    return data.choices[0].message.content || '';

  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
};