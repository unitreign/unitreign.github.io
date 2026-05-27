const PROJECTS = [
  {
    hidden: false,
    title: 'calliope',
    status: 'oss',
    description: 'desktop music sync manager for snowsky echo. handles flac encoding, art resizing, and genre playlists.',
    tags: ['python', 'pyqt6', 'desktop'],
    links: [
      { href: 'https://github.com/unitreign/calliope/releases/', icon: 'fa-solid fa-download', title: 'download' },
      { href: 'https://github.com/unitreign/calliope', icon: 'fa-brands fa-github', title: 'view on github' }
    ]
  },
  {
    hidden: false,
    title: 'loomi',
    status: 'live',
    description: 'native android lofi companion for chill beats and ambient vibes.',
    tags: ['kotlin', 'android', 'native'],
    links: [
      { href: 'https://radio.reign.fyi/', icon: 'fa-solid fa-arrow-up-right-from-square', title: 'listen' }
    ]
  },
  {
    hidden: false,
    title: 'reign tools',
    status: 'live',
    description: 'fast browser tools for text and images. no ai, just math and javascript.',
    tags: ['vanilla js', 'canvas api', 'client-side'],
    links: [
      { href: 'https://tools.reign.fyi/', icon: 'fa-solid fa-arrow-up-right-from-square', title: 'view project' }
    ]
  },
  {
    hidden: true,
    title: 'commit-palette',
    status: 'live',
    description: 'customizable github contribution graph.',
    tags: ['react', 'github api', 'vercel'],
    links: [
      { href: 'https://commit-palette.vercel.app/', icon: 'fa-solid fa-arrow-up-right-from-square', title: 'view project' }
    ]
  },
  {
    hidden: true,
    title: 'crosspoint-covergen',
    status: 'oss',
    description: 'simple python script for making cover images for Crosspoint firmware.',
    tags: ['python', 'cli', 'image gen'],
    links: [
      { href: 'https://github.com/unitreign/crosspoint-covergen', icon: 'fa-brands fa-github', title: 'view on github' }
    ]
  },
  {
    hidden: true,
    title: 'nimbus',
    status: 'wip',
    description: 'turn browser chaos into a visual workspace. capture, connect, and organize on a zoomable canvas.',
    tags: ['chrome extension', 'local-first', 'canvas', 'keyboard-first'],
    links: []
  },
];

(function renderProjects() {
  const wrap = document.querySelector('.projects-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  PROJECTS.filter(p => !p.hidden).forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'project';

    const num = String(i + 1).padStart(2, '0');
    const tagsHtml  = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const linksHtml = p.links.map(l =>
      `<a href="${l.href}" class="project-link" target="_blank" title="${l.title}"><i class="${l.icon}"></i></a>`
    ).join('');

    div.innerHTML = `
      <span class="proj-num">${num}</span>
      <div class="proj-info">
        <h3>${p.title}<span class="proj-status ${p.status}">${p.status}</span></h3>
        <p>${p.description}</p>
        <div class="tags">${tagsHtml}</div>
      </div>
      <div class="meta">${linksHtml}</div>
    `;

    wrap.appendChild(div);
  });
})();
