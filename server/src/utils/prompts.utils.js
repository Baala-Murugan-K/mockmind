export const parseGeminiJSON = (text) => {
  try {
    let clean = text.trim();

    // Strip markdown fences
    clean = clean.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');

    // Find the first [ or { and last ] or }
    const arrStart = clean.indexOf('[');
    const objStart = clean.indexOf('{');
    
    let start = -1;
    let isArray = false;

    if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
      start = arrStart;
      isArray = true;
    } else if (objStart !== -1) {
      start = objStart;
      isArray = false;
    }

    if (start === -1) throw new Error('No JSON found in response');

    const end = isArray ? clean.lastIndexOf(']') : clean.lastIndexOf('}');
    clean = clean.substring(start, end + 1);

    return JSON.parse(clean);
  } catch (error) {
    throw new Error(`Failed to parse Gemini JSON response: ${error.message}`);
  }
};