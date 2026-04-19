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

// Auto-resize contribution iframe
window.addEventListener('message', (e) => {
  if (e.data && e.data.commitPaletteHeight) {
    document.getElementById('contribIframe').style.height = e.data.commitPaletteHeight + 'px';
  }
});

// Clock
function tick() {
  document.getElementById('clock').textContent =
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' local';
}
tick();
setInterval(tick, 1000);

// Desktop tabs (projects / blog)
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// Mobile tabs (about / projects / blog)
document.querySelectorAll('.m-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.m-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const mtab = tab.dataset.mtab;
    const main = document.querySelector('.main');
    main.classList.remove('m-projects', 'm-blog');

    if (mtab === 'projects' || mtab === 'blog') {
      main.classList.add('m-' + mtab);
      // Sync which right-panel tab is active
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.querySelector(`.tab[data-tab="${mtab}"]`).classList.add('active');
      document.getElementById('tab-' + mtab).classList.add('active');
    }
  });
});

// Reader
let blogPosts = [];

function addCopyButtons() {
  document.querySelectorAll('#readerContent pre').forEach(pre => {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'copy';
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(pre.innerText).then(() => {
        btn.textContent = 'copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 1800);
      });
    });
    wrapper.appendChild(btn);
  });
}

function openReader(index) {
  const post = blogPosts[index];
  if (!post) return;

  const title = post.title || '';
  document.getElementById('readerTitle').textContent = title;
  document.getElementById('readerTitleBar').textContent = title;

  const dateStr = post.pubDate || '';
  if (dateStr) {
    const d = new Date(dateStr);
    const day   = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    const year  = d.getFullYear();
    document.getElementById('readerMeta').textContent = `${day} ${month} ${year}`;
  } else {
    document.getElementById('readerMeta').textContent = '';
  }

  document.getElementById('readerContent').innerHTML = post.content || post.description || '';
  addCopyButtons();

  document.querySelector('.page').classList.add('reader-open');
  document.getElementById('readerArea').scrollTop = 0;
  window.scrollTo(0, 0);
}

function closeReader() {
  document.querySelector('.page').classList.remove('reader-open');
}

document.getElementById('readerBack').addEventListener('click', closeReader);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeReader(); });

// Blog RSS fetch
async function loadBlogPosts() {
  const list = document.getElementById('blog-list');
  const feedUrl = 'https://reign.bearblog.dev/feed/';
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

  try {
    const res  = await fetch(apiUrl);
    const data = await res.json();

    if (data.status !== 'ok') throw new Error('RSS2JSON failed');

    blogPosts = data.items || [];
    list.innerHTML = '';

    if (blogPosts.length === 0) {
      list.innerHTML = '<div class="writing-row"><span class="write-date">—</span><span class="write-title" style="opacity:0.4;">no posts yet.</span></div>';
      return;
    }

    blogPosts.forEach((item, index) => {
      const dateStr = item.pubDate || '';
      let formatted = '—';
      if (dateStr) {
        const d     = new Date(dateStr);
        const day   = String(d.getDate()).padStart(2, '0');
        const month = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
        formatted   = `${day} ${month}`;
      }

      const row      = document.createElement('div');
      row.className  = 'writing-row';
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => openReader(index));

      const dateSpan       = document.createElement('span');
      dateSpan.className   = 'write-date';
      dateSpan.textContent = formatted;

      const titleSpan       = document.createElement('span');
      titleSpan.className   = 'write-title';
      titleSpan.textContent = item.title || '';

      const icon      = document.createElement('a');
      icon.className  = 'project-link';
      icon.href       = item.link || '#';
      icon.target     = '_blank';
      icon.title      = 'open on blog';
      icon.innerHTML  = '<i class="fa-solid fa-arrow-up-right-from-square"></i>';
      icon.style.display = 'none';
      icon.addEventListener('click', e => e.stopPropagation());

      row.appendChild(dateSpan);
      row.appendChild(titleSpan);
      row.appendChild(icon);
      list.appendChild(row);
    });

  } catch {
    list.innerHTML = '<div class="writing-row"><span class="write-date">—</span><span class="write-title" style="opacity:0.4;">could not load posts.</span></div>';
  }
}

loadBlogPosts();
