// Prompt user for API key and cache it
function getApiKey() {
  let key = localStorage.getItem('gemini_api_key');
  if (!key) {
    key = prompt('దయచేసి మీ Gemini API Key ఇవ్వండి:');
    if (key) localStorage.setItem('gemini_api_key', key);
  }
  return key;
}

// New prompt: pure JSON output
function buildPrompt() {
  return `Return ONLY a JSON object with these keys:
{
  "telugu_verse": "<verse>",
  "telugu_translation": "<translation>",
  "telugu_message": "<message>"
}
No markdown, no backticks, no extra text.`;
}

// Fetch from Gemini 2.0-flash
async function fetchShloka() {
  const key = getApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({contents: [{parts: [{text: buildPrompt()}]}]})
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const jsonStr = data.candidates[0].content.parts[0].text.trim();
    console.log('Gemini JSON:', jsonStr);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Fetch/Parse error:', err);
    return {telugu_verse: 'క్షమించండి, లోడ్ చేయలేకపోయాం.', telugu_translation: '', telugu_message: err.message};
  }
}

// Display and speech
function display(data) {
  document.getElementById('shlokaText').textContent = data.telugu_verse;
  document.getElementById('translationText').textContent = data.telugu_translation;
  document.getElementById('messageText').textContent = data.telugu_message;
}

async function init() {
  display({telugu_verse: 'లోడ్ అవుతోంది...', telugu_translation: '', telugu_message: ''});
  const shloka = await fetchShloka();
  display(shloka);
}

document.getElementById('refreshBtn').onclick = init;
document.getElementById('audioBtn').onclick = () => {
  const text = [
    document.getElementById('shlokaText').textContent,
    document.getElementById('translationText').textContent,
    document.getElementById('messageText').textContent
  ].join('। ');
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'te-IN';
  speechSynthesis.speak(utter);
};

window.onload = () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
  init();
};