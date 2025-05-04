const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyA_-yVCHCsPdRKtNMcd6tdlmPLmgun9lzY';
const lastKey = 'lastShlokaIndex';
let lastIndex = localStorage.getItem(lastKey);

// Build prompt
function buildPrompt() {
  return `నాకు ఒక యాదృచ్ఛిక భగవద్గీత శ్లోకాన్ని తెలుగులో ఇవ్వండి, దాని అనువాదం మరియు ముఖ్య సందేశాన్ని తెలుగులో JSON ఫార్మాట్‌లో:
{
  "shloka": "...",
  "translation": "...",
  "message": "..."
}
గమనిక: ఒకే శ్లోకం రెండుసార్లు చూపబడకుండా జాగ్రత్తగా తీసుకోండి.`;
}

async function fetchShloka() {
  const prompt = buildPrompt();
  const res = await fetch(API_URL, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      prompt: {text: prompt}, maxTokens: 400,
    })
  });
  const data = await res.json();
  const obj = JSON.parse(data.candidates[0].output);
  return obj;
}

function display(obj) {
  document.getElementById('shlokaText').textContent = obj.shloka;
  document.getElementById('translationText').textContent = obj.translation;
  document.getElementById('messageText').textContent = obj.message;
}

function init() {
  fetchShloka().then(obj => {
    display(obj);
  });
}

const audioBtn = document.getElementById('audioBtn');
audioBtn.onclick = () => {
  const text =
    document.getElementById('shlokaText').textContent + '। ' +
    document.getElementById('translationText').textContent + '। ' +
    document.getElementById('messageText').textContent;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'te-IN';
  speechSynthesis.speak(utter);
};

document.getElementById('refreshBtn').onclick = init;
window.onload = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
  init();
};