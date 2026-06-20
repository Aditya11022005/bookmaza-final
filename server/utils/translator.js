/**
 * Translates English text to Marathi using Google's public translation API.
 * @param {string} text - The input text to be translated.
 * @returns {Promise<string>} The translated Marathi string.
 */
export const translateToMarathi = async (text) => {
  if (!text || typeof text !== 'string') return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=mr&dt=t&q=${encodeURIComponent(text.trim())}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Translation service responded with status:', response.status);
      return '';
    }
    const data = await response.json();
    if (data && data[0] && Array.isArray(data[0])) {
      return data[0].map(item => item[0]).join('');
    }
    return '';
  } catch (error) {
    console.error('Auto-translation failed:', error.message);
    return '';
  }
};
