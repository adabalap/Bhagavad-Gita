const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA_-yVCHCsPdRKtNMcd6tdlmPLmgun9lzY';

// Build prompt to avoid repeats
function buildPrompt() {
  return `నాకు ఒక యాదృచ్ఛిక భగవద్గీత శ్లోకాన్ని తెలుగులో ఇవ్వండి, దాని అనువాదం మరియు ముఖ్య సందేశాన్ని తెలుగులో క్రింది JSON ఫార్మాట్‌లో:
{
  "shloka": "...",
  "translation": "...",
  "message": "..."
}
గమనిక: ఒకే శ్లోకం రెండుసార్లు చూపబడకుండా జాగ్రత్తగా తీసుకోండి.`;
}

async function fetchShloka() {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: { text: buildPrompt() },
        temperature: 0.5,
        maxOutputTokens: 400
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.output;
    if (!text) throw new Error('No output in response');
    return JSON.parse(text);
  } catch (err) {
    console.error('Error fetching shloka:', err);
    return { shloka: 'క్షమించండి, లోడ్ చేయలేకపోయాం.', translation: '', message: '' };
  }
}

function display({ shloka, translation, message }) {
  document.getElementById('shlokaText').textContent = shloka;
  document.getElementById('translationText').textContent = translation;
  document.getElementById('messageText').textContent = message;
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