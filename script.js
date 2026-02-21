function toggleTheme() {
  const html = document.documentElement;
  const iframe = document.getElementById('contribIframe');
  
  if (html.dataset.theme === 'dark') {
    html.dataset.theme = 'light';
    localStorage.setItem('theme', 'light');
    iframe.src = 'https://commit-palette.vercel.app?username=unitreign&colors=d4cfc6,d4c9e8,b5a0d4,9478bc,7c4dba,1a1a1a&months=6';
  } else {
    html.dataset.theme = 'dark';
    localStorage.setItem('theme', 'dark');
    iframe.src = 'https://commit-palette.vercel.app?username=unitreign&colors=33312c,2d2848,4a3d72,6b56a0,9b6fd4,e8e4dc&months=6';
  }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.dataset.theme = savedTheme;

// Set initial iframe theme
const iframe = document.getElementById('contribIframe');
if (savedTheme === 'light') {
  iframe.src = 'https://commit-palette.vercel.app?username=unitreign&colors=d4cfc6,d4c9e8,b5a0d4,9478bc,7c4dba,1a1a1a&months=6';
}

// Clock
function tick() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }) + ' local';
}
tick();
setInterval(tick, 1000);