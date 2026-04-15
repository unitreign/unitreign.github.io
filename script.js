// Theme
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

const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.dataset.theme = savedTheme;
const iframe = document.getElementById('contribIframe');
if (savedTheme === 'light') {
  iframe.src = 'https://commit-palette.vercel.app?username=unitreign&colors=d4cfc6,d4c9e8,b5a0d4,9478bc,7c4dba,1a1a1a&months=6';
}

// Clock
function tick() {
  document.getElementById('clock').textContent =
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' local';
}
tick();
setInterval(tick, 1000);

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// Blog RSS fetch
async function loadBlogPosts() {
  const list = document.getElementById('blog-list');
  try {
    const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://reign.bearblog.dev/feed/'));
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, 'application/xml');
    const entries = Array.from(xml.querySelectorAll('entry'));

    list.innerHTML = '';

    if (entries.length === 0) {
      list.innerHTML = '<div class="writing-row"><span class="write-date">—</span><span class="write-title" style="opacity:0.4;">no posts yet.</span></div>';
      return;
    }

    entries.forEach(entry => {
      const title = entry.querySelector('title')?.textContent?.trim() || '';
      const url   = entry.querySelector('id')?.textContent?.trim()    || '#';
      const dateStr = entry.querySelector('updated')?.textContent?.trim() || '';

      let formatted = '—';
      if (dateStr) {
        const d = new Date(dateStr);
        const day   = String(d.getDate()).padStart(2, '0');
        const month = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
        formatted = `${day} ${month}`;
      }

      const row      = document.createElement('div');
      row.className  = 'writing-row';

      const dateSpan      = document.createElement('span');
      dateSpan.className  = 'write-date';
      dateSpan.textContent = formatted;

      const titleLink      = document.createElement('a');
      titleLink.className  = 'write-title';
      titleLink.href       = url;
      titleLink.target     = '_blank';
      titleLink.textContent = title;

      const icon      = document.createElement('a');
      icon.className  = 'project-link';
      icon.href       = url;
      icon.target     = '_blank';
      icon.title      = 'read post';
      icon.innerHTML  = '<i class="fa-solid fa-arrow-up-right-from-square"></i>';

      row.appendChild(dateSpan);
      row.appendChild(titleLink);
      row.appendChild(icon);
      list.appendChild(row);
    });
  } catch {
    list.innerHTML = '<div class="writing-row"><span class="write-date">—</span><span class="write-title" style="opacity:0.4;">could not load posts.</span></div>';
  }
}

loadBlogPosts();
