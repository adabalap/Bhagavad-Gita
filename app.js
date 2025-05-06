function getApiKey() {
  let key = localStorage.getItem('gemini_api_key');
  if (!key) {
    key = prompt('దయచేసి మీ Gemini API key ను ఇవ్వండి:');
    if (key) localStorage.setItem('gemini_api_key', key);
  }
  return key;
}

function buildPrompt() {
  return `Give me a Bhagavad Gita verse in Telugu with translation and message in Telugu in JSON format.`;
}

function sanitizeGeminiResponse(rawText) {
  const cleaned = rawText.replace(/^```json\n|\n```$/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON parse error. Raw:', cleaned);
    return { shloka: 'క్షమించండి, లోడ్ చేయలేకపోయాం.', translation: '', message: '' };
  }
}

async function fetchShloka() {
  const key = getApiKey();
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt() }] }]
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Raw Gemini response:', rawText);
    return sanitizeGeminiResponse(rawText);
  } catch (err) {
    console.error('Error fetching shloka:', err);
    return { shloka: 'క్షమించండి, లోడ్ చేయలేకపోయాం.', translation: '', message: '' };
  }
}

function display(data) {
  document.getElementById('shlokaText').textContent = data.telugu_verse || data.shloka || '...';
  document.getElementById('translationText').textContent = data.telugu_translation || data.translation || '';
  document.getElementById('messageText').textContent = data.telugu_message || data.message || '';
}

async function init() {
  display({ shloka: 'లోడ్ అవుతోంది...', translation: '', message: '' });
  const obj = await fetchShloka();
  display(obj);
}

document.getElementById('refreshBtn').addEventListener('click', init);
document.getElementById('audioBtn').addEventListener('click', () => {
  const text = [
    document.getElementById('shlokaText').textContent,
    document.getElementById('translationText').textContent,
    document.getElementById('messageText').textContent
  ].join('। ');
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'te-IN';
  speechSynthesis.speak(utter);
});

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
  init();
});