const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAnp0lHEZnajMbDavNPrrTUhSGareRwFp0';

function buildPrompt() {
  return `భగవద్గీత నుండి ఒక యాదృచ్ఛిక శ్లోకాన్ని తెలుగులో ఇవ్వండి. దాని అనువాదం మరియు ముఖ్య సందేశాన్ని తెలుగులో ఈ ఫార్మాట్‌లో ఇవ్వండి:
{
  "shloka": "...",
  "translation": "...",
  "message": "..."
}`; 
}

async function fetchShloka() {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: buildPrompt() }
            ]
          }
        ]
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    return parsed;
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