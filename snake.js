(() => {
  // ── Konami: ↑ ↑ ↓ ↓ ← → ← → B A ────────────────────────────────────────
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let ki = 0;
  document.addEventListener('keydown', e => {
    if (snakeVisible) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    ki = (k === KONAMI[ki] ? ki + 1 : k === KONAMI[0] ? 1 : 0);
    if (ki === KONAMI.length) { ki = 0; showSnake(); }
  });

  // ── DOM ───────────────────────────────────────────────────────────────────
  const iframe = document.getElementById('contribIframe');
  const canvas = document.getElementById('snakeCanvas');
  const ctx    = canvas.getContext('2d');
  let snakeVisible = false;

  function showSnake() {
    snakeVisible = true;
    iframe.style.display = 'none';
    canvas.style.display = 'block';
    if (!booted) boot(); else { init(); startLoop(); }
  }
  function hideSnake() {
    snakeVisible = false;
    stopLoop();
    canvas.style.display = 'none';
    iframe.style.display = 'block';
  }

  // ── Palette ───────────────────────────────────────────────────────────────
  const PAL = {
    dark: {
      bg:    '#1a1917', empty: '#23221f', food: '#9b6fd4',
      snake: ['#2d2848','#4a3d72','#6b56a0','#9b6fd4'],
      text:  '#8a857b', score: '#6b56a0',
    },
    light: {
      bg:    '#f4f1eb', empty: '#ece8e0', food: '#7c4dba',
      snake: ['#d4c9e8','#b5a0d4','#9478bc','#7c4dba'],
      text:  '#7a756d', score: '#9478bc',
    },
  };
  const T = () => PAL[document.documentElement.dataset.theme] || PAL.dark;

  // ── Grid config ───────────────────────────────────────────────────────────
  // Fixed logical grid size; cell pixel size derived from canvas dimensions
  const COLS = 38, ROWS = 12;
  const GAP  = 2;   // gap between blocks in px (at reference size)
  const SPEED = 130;

  // Derived per-draw from canvas size
  function cellW() { return canvas.width  / COLS; }
  function cellH() { return canvas.height / ROWS; }
  function blockW() { return Math.max(1, cellW() - GAP); }
  function blockH() { return Math.max(1, cellH() - GAP); }

  // ── State ─────────────────────────────────────────────────────────────────
  let snake, dir, nextDir, food, score, state, lastTick, rafId, booted = false;

  // ── Audio ─────────────────────────────────────────────────────────────────
  let audioCtx;
  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playEat() {
    try {
      const ac = getAudio();
      const t  = ac.currentTime;
      [440, 660].forEach((freq, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'square';
        o.frequency.setValueAtTime(freq, t + i * 0.06);
        g.gain.setValueAtTime(0.08, t + i * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.08);
        o.start(t + i * 0.06);
        o.stop(t + i * 0.06 + 0.08);
      });
    } catch {}
  }

  function playDie() {
    try {
      const ac = getAudio();
      const t  = ac.currentTime;
      [330, 220, 110].forEach((freq, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(freq, t + i * 0.09);
        g.gain.setValueAtTime(0.1, t + i * 0.09);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.12);
        o.start(t + i * 0.09);
        o.stop(t + i * 0.09 + 0.12);
      });
    } catch {}
  }

  // ── Sizing ────────────────────────────────────────────────────────────────
  function applySize(w, h) {
    canvas.width  = Math.round(w);
    canvas.height = Math.round(h);
  }

  const ro = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    if (width < 1 || height < 1) return;
    applySize(width, height);
    if (snakeVisible) draw();
  });
  ro.observe(canvas);

  function boot() {
    booted = true;
    if (!canvas.width) applySize(canvas.offsetWidth || iframe.offsetWidth || 400, 150);
    init();
    startLoop();
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    const mc = Math.floor(COLS / 2), mr = Math.floor(ROWS / 2);
    snake   = [{ x: mc, y: mr }, { x: mc-1, y: mr }, { x: mc-2, y: mr }];
    dir     = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score   = 0;
    state   = 'idle';
    placeFood();
    draw();
  }

  function placeFood() {
    const taken = new Set(snake.map(s => `${s.x},${s.y}`));
    let f;
    do { f = { x: ri(COLS), y: ri(ROWS) }; } while (taken.has(`${f.x},${f.y}`));
    food = f;
  }

  // ── Loop ──────────────────────────────────────────────────────────────────
  function tick(ts) {
    rafId = requestAnimationFrame(tick);
    draw();
    if (state !== 'playing') return;
    if (!lastTick) { lastTick = ts; return; }
    if (ts - lastTick < SPEED) return;
    lastTick = ts;

    dir = { ...nextDir };
    const head = {
      x: ((snake[0].x + dir.x) + COLS) % COLS,
      y: ((snake[0].y + dir.y) + ROWS) % ROWS,
    };

    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      state = 'dead'; playDie(); return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++; placeFood(); playEat();
    } else {
      snake.pop();
    }
  }

  function startLoop() { stopLoop(); lastTick = null; rafId = requestAnimationFrame(tick); }
  function stopLoop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  // ── Draw ──────────────────────────────────────────────────────────────────
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function draw() {
    if (!canvas.width || !canvas.height) return;
    const t = T(), W = canvas.width, H = canvas.height;
    const cw = cellW(), ch = cellH(), bw = blockW(), bh = blockH(), br = Math.min(bw, bh) * 0.2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, H);

    // Empty grid — cells fill full canvas
    ctx.fillStyle = t.empty;
    for (let c = 0; c < COLS; c++)
      for (let r = 0; r < ROWS; r++) {
        rr(c * cw, r * ch, bw, bh, br); ctx.fill();
      }

    // Food
    ctx.shadowColor = t.food; ctx.shadowBlur = 8;
    ctx.fillStyle   = t.food;
    rr(food.x * cw, food.y * ch, bw, bh, br); ctx.fill();
    ctx.shadowBlur  = 0;

    // Snake
    snake.forEach((seg, i) => {
      const pct = snake.length > 1 ? i / (snake.length - 1) : 0;
      ctx.fillStyle = t.snake[Math.round((1 - pct) * (t.snake.length - 1))];
      rr(seg.x * cw, seg.y * ch, bw, bh, br); ctx.fill();
    });

    // HUD
    ctx.font = '10px "DM Mono", monospace';
    ctx.textBaseline = 'middle';
    if (state === 'idle') {
      ctx.fillStyle = t.text; ctx.textAlign = 'center';
      ctx.fillText('click · wasd · arrows  to play', W / 2, H / 2);
    } else if (state === 'dead') {
      ctx.fillStyle = t.food; ctx.textAlign = 'center';
      ctx.fillText(`dead — score: ${score}  ·  click or enter to restart`, W / 2, H / 2);
    } else {
      ctx.fillStyle = t.score; ctx.textAlign = 'right';
      ctx.fillText(score, W - 4, 8);
    }
    ctx.font = '9px "DM Mono", monospace';
    ctx.fillStyle = t.text; ctx.textAlign = 'right';
    ctx.fillText('esc — exit', W - 4, H - 5);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }

  // ── Input ─────────────────────────────────────────────────────────────────
  const DIRS = {
    ArrowUp:{x:0,y:-1}, w:{x:0,y:-1}, W:{x:0,y:-1},
    ArrowDown:{x:0,y:1}, s:{x:0,y:1}, S:{x:0,y:1},
    ArrowLeft:{x:-1,y:0}, a:{x:-1,y:0}, A:{x:-1,y:0},
    ArrowRight:{x:1,y:0}, d:{x:1,y:0}, D:{x:1,y:0},
  };

  document.addEventListener('keydown', e => {
    if (!snakeVisible) return;
    if (e.key === 'Escape') { hideSnake(); return; }
    const d = DIRS[e.key];
    if (!d) {
      if ((e.key === 'Enter' || e.key === ' ') && state === 'dead') { init(); state = 'playing'; }
      return;
    }
    e.preventDefault();
    if (state === 'idle')  { state = 'playing'; nextDir = d; return; }
    if (state === 'dead')  { init(); state = 'playing'; nextDir = d; return; }
    if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
  });

  canvas.addEventListener('click', () => {
    if (state === 'idle' || state === 'dead') { if (state === 'dead') init(); state = 'playing'; }
    canvas.focus();
  });

  window.snakeApplyTheme = () => { if (snakeVisible) draw(); };
  function ri(n) { return Math.floor(Math.random() * n); }
})();
