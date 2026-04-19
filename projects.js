const PROJECTS = [
  {
    num: '01',
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
    num: '02',
    title: 'loomi',
    status: 'oss',
    description: 'native android lofi companion for chill beats and ambient vibes.',
    tags: ['kotlin', 'android', 'native'],
    links: [
      { href: 'https://github.com/unitreign/loomi-android/releases/', icon: 'fa-solid fa-download', title: 'download apk' },
      { href: 'https://github.com/unitreign/loomi-android', icon: 'fa-brands fa-github', title: 'view on github' }
    ]
  },
  {
    num: '03',
    title: 'reign tools',
    status: 'live',
    description: 'fast browser tools for text and images. no ai, just math and javascript.',
    tags: ['vanilla js', 'canvas api', 'client-side'],
    links: [
      { href: 'https://reign-tools.vercel.app/', icon: 'fa-solid fa-arrow-up-right-from-square', title: 'view project' }
    ]
  },
  {
    num: '04',
    title: 'commit-palette',
    status: 'live',
    description: 'customizable github contribution graph.',
    tags: ['react', 'github api', 'vercel'],
    links: [
      { href: 'https://commit-palette.vercel.app/', icon: 'fa-solid fa-arrow-up-right-from-square', title: 'view project' }
    ]
  },
  {
    num: '05',
    title: 'crosspoint-covergen',
    status: 'oss',
    description: 'simple python script for making cover images for Crosspoint firmware.',
    tags: ['python', 'cli', 'image gen'],
    links: [
      { href: 'https://github.com/unitreign/crosspoint-covergen', icon: 'fa-brands fa-github', title: 'view on github' }
    ]
  },
  {
    num: '06',
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

  PROJECTS.forEach(p => {
    const div = document.createElement('div');
    div.className = 'project';

    const tagsHtml  = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const linksHtml = p.links.map(l =>
      `<a href="${l.href}" class="project-link" target="_blank" title="${l.title}"><i class="${l.icon}"></i></a>`
    ).join('');

    div.innerHTML = `
      <span class="proj-num">${p.num}</span>
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
