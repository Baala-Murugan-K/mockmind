import fetch from 'node-fetch';

const MURF_BASE_URL = 'https://global.api.murf.ai/v1/speech/stream';
const MURF_VOICE_ID = 'en-US-natalie';
const MURF_LOCALE = 'en-US';

const getMurfPayload = (text) => ({
  text: `[pause 1s] ${text}`,
  voiceId: MURF_VOICE_ID,
  model: 'FALCON',
  multiNativeLocale: MURF_LOCALE,
  format: 'MP3',
});

export const streamAudio = async (text, res) => {
  try {
    const response = await fetch(MURF_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.MURF_API_KEY,
      },
      body: JSON.stringify(getMurfPayload(text)),
    });

    if (!response.ok) {
      throw new Error(`Murf API error: ${response.status}`);
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    response.body.pipe(res);
  } catch (error) {
    console.error('Murf stream error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Audio generation failed' });
    }
  }
};

export const generateAudio = async (text) => {
  try {
    const response = await fetch(MURF_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.MURF_API_KEY,
      },
      body: JSON.stringify(getMurfPayload(text)),
    });

    if (!response.ok) {
      throw new Error(`Murf API error: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.error('Murf generate error:', error.message);
    return null; // Non-fatal — interview continues without audio
  }
};
