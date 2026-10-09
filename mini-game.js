// mini-game.js — Standalone mini-game: Level 1 (Roach Motel), Level 1 AI (AI Roach Motel), Level 3 AI (AI Synthetic Social Proof)

// ── Audio (SFX stubs — silent fallbacks if AudioContext not available) ──────
let _ac = null;
function getAC() {
  if (!_ac) { try { _ac = new AudioContext(); } catch(e) {} }
  return _ac;
}
function tone(freq, dur, type='sine', vol=0.18) {
  const ac = getAC(); if (!ac) return;
  try {
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.start(); o.stop(ac.currentTime + dur);
  } catch(e) {}
}
function caught()     { tone(220, 0.18, 'sawtooth', 0.12); setTimeout(() => tone(180, 0.22, 'sawtooth', 0.09), 120); }
function almost()     { tone(440, 0.12, 'triangle', 0.1); }
function levelClear() { [523,659,784].forEach((f,i) => setTimeout(() => tone(f, 0.18, 'sine', 0.15), i*110)); }

// ── Level files (inline) ─────────────────────────────────────────────────────
// Loaded via import in index.html; LEVELS is assembled after imports.
// (See bottom of this file for LEVELS assembly.)

// ── State ────────────────────────────────────────────────────────────────────
let score         = 0;
let streak        = 0;
let levelIdx      = 0;
let levelAttempts = 0;
let hintState     = {};
let hoverTimers   = {};
let levelScores   = [];

function getLevelAttempts() { return levelAttempts; }
function resetHintState()   { hintState = {}; }

// ── Screen management ────────────────────────────────────────────────────────
const SCREENS = ['intro', 'brief', 'level', 'debrief', 'win'];

function setScr(name) {
  SCREENS.forEach(s => {
    const el = document.getElementById('scr-' + s);
    if (el) el.classList.toggle('active', s === name);
  });
}

// ── HUD ──────────────────────────────────────────────────────────────────────
function renderScore() {
  const el = document.getElementById('h-score');
  if (el) el.textContent = score;
}

function renderStreak() {
  const el = document.getElementById('h-streak');
  if (!el) return;
  if (streak >= 2) { el.style.display = ''; el.textContent = `${streak}× streak`; }
  else el.style.display = 'none';
}

function renderDots(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = LEVELS.map((lv, i) => {
    let c = 'dot';
    if (lv.isAI) c += i < levelIdx ? ' ai-done' : i === levelIdx ? ' ai-cur' : '';
    else         c += i < levelIdx ? ' done'    : i === levelIdx ? ' cur'    : '';
    return `<div class="${c}"></div>`;
  }).join('');
}

function popScore(pts) {
  const pop = document.createElement('div');
  pop.className   = 'score-pop';
  pop.textContent = '+' + pts;
  pop.style.cssText = 'position:fixed;top:60px;right:20px';
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
}

function spawnConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = Array.from({length: 60}, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 40,
    r: 4 + Math.random() * 5,
    d: 2 + Math.random() * 3,
    color: ['#39d98a','#7c6ef7','#f5a623','#ff4f4f','#aea6fa'][Math.floor(Math.random()*5)],
    tilt: Math.random() * 10 - 5,
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.6, p.tilt, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y += p.d; p.x += Math.sin(frame * 0.05) * 0.8;
    });
    frame++;
    if (frame < 120) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ── Overlay positioning ──────────────────────────────────────────────────────
function placeOverlay(d, anchor) {
  const lc = document.getElementById('lc');
  if (!lc) { document.body.appendChild(d); return; }
  const rect = lc.getBoundingClientRect();
  d.style.left  = (rect.left + 16) + 'px';
  d.style.width = (rect.width - 32) + 'px';
  if (anchor === 'bottom') {
    d.style.bottom = (window.innerHeight - rect.bottom + 16) + 'px';
  } else {
    d.style.top = (rect.top + 16) + 'px';
  }
  document.body.appendChild(d);
}

// ── Hint ─────────────────────────────────────────────────────────────────────
function showHint() {
  const lv = LEVELS[levelIdx];
  if (!lv?.hints) return;
  const level = hintState.level || 0;
  const hint  = lv.hints[Math.min(level, lv.hints.length - 1)];
  hintState.level = level + 1;
  hintState.used  = true;

  document.getElementById('hint-bubble')?.remove();
  const d = document.createElement('div');
  d.id = 'hint-bubble';
  d.className = 'hint-bubble';
  d.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <span>💡 <strong>Hint ${level + 1} of ${lv.hints.length}:</strong> ${hint}</span>
      <button onclick="document.getElementById('hint-bubble')?.remove()" style="background:none;border:none;cursor:pointer;font-size:14px;color:inherit;padding:0;flex-shrink:0;line-height:1">✕</button>
    </div>`;
  hintState.text = d.innerHTML;
  placeOverlay(d, 'bottom');

  if (hintState.level >= lv.hints.length) {
    const btn = document.getElementById('h-hint-btn');
    if (btn) { btn.textContent = 'No more hints'; btn.disabled = true; }
  }
}

// ── Succeed ───────────────────────────────────────────────────────────────────
function succeed() {
  document.getElementById('hint-bubble')?.remove();
  streak++;
  const pct   = levelAttempts === 0 ? 100 : levelAttempts === 1 ? 60 : levelAttempts === 2 ? 25 : 0;
  const bonus  = (levelAttempts === 0 && streak >= 3) ? 20 : 0;
  const pts    = Math.round(pct + bonus);
  score += pts;
  levelScores[levelIdx] = pct;
  popScore(pts);
  levelClear(pct);

  const lc = document.getElementById('lc');
  if (lc) { lc.classList.add('flash-green'); setTimeout(() => lc.classList.remove('flash-green'), 500); }
  if (levelAttempts === 0) spawnConfetti();
  showDebrief(true);
}

// ── Fail ──────────────────────────────────────────────────────────────────────
function fail(msg) {
  document.getElementById('hint-bubble')?.remove();
  levelAttempts++;
  streak = 0;

  const hintBtn = document.getElementById('h-hint-btn');
  if (hintBtn) hintBtn.style.display = '';

  renderScore();
  renderStreak();
  caught();

  const app = document.getElementById('app');
  if (app) { app.classList.add('shake'); setTimeout(() => app.classList.remove('shake'), 400); }

  const lc = document.getElementById('lc');
  if (lc) { lc.classList.add('flash-red'); setTimeout(() => lc.classList.remove('flash-red'), 500); }

  const d = document.createElement('div');
  d.className   = 'damage-msg';
  d.textContent = (msg || 'Not quite!');
  placeOverlay(d, 'top');
  setTimeout(() => d.remove(), 3800);

  if (hintState.text && !document.getElementById('hint-bubble')) {
    const h = document.createElement('div');
    h.id = 'hint-bubble';
    h.className = 'hint-bubble';
    h.innerHTML = hintState.text;
    placeOverlay(h, 'bottom');
  }
}

// ── almostGotYou ──────────────────────────────────────────────────────────────
function almostGotYou(el, msg) {
  almost();
  const d = document.createElement('div');
  d.className   = 'almost-msg';
  d.textContent = msg || 'You almost fell for it — watch out!';
  placeOverlay(d, 'top');
  setTimeout(() => d.remove(), 2200);
}

// ── Brief screen ──────────────────────────────────────────────────────────────
function showBrief() {
  setScr('brief');
  const lv    = LEVELS[levelIdx];
  const total = LEVELS.length;

  document.getElementById('brief-lvl-label').textContent    = `Level ${levelIdx + 1} of ${total}`;
  document.getElementById('brief-type-label').textContent   = lv.isAI ? 'AI-powered hyper level' : '';

  const bpn = document.getElementById('brief-pattern-name');
  bpn.textContent = lv.pattern;
  bpn.className   = 'brief-pattern' + (lv.isAI ? ' is-ai' : '');

  document.getElementById('brief-what').textContent        = lv.brief;
  document.getElementById('brief-goal').textContent        = lv.goal;
  document.getElementById('brief-goal-detail').textContent = lv.goalDetail || '';

  const aiNote = document.getElementById('brief-ai-note');
  const aiText = document.getElementById('brief-ai-text');
  if (lv.isAI && lv.aiIntro) {
    aiNote.style.display = 'flex';
    aiText.textContent   = lv.aiIntro;
  } else {
    aiNote.style.display = 'none';
  }
}

// ── Level screen ──────────────────────────────────────────────────────────────
function showLevel() {
  setScr('level');
  levelAttempts = 0;
  hoverTimers   = {};
  resetHintState();

  const hintBtn = document.getElementById('h-hint-btn');
  if (hintBtn) {
    hintBtn.disabled      = false;
    hintBtn.textContent   = '💡 Hint';
    hintBtn.style.display = '';
  }

  const lv = LEVELS[levelIdx];
  document.getElementById('h-lvl').textContent  = `Level ${levelIdx + 1} of ${LEVELS.length}`;
  document.getElementById('h-goal').textContent = 'Goal: ' + lv.goal;

  // Populate info bar
  const patEl  = document.getElementById('h-pattern');
  const infoEl = document.getElementById('h-info-text');
  if (patEl)  patEl.textContent  = lv.pattern;
  if (infoEl) infoEl.textContent = lv.brief;
  const infoBar = document.getElementById('h-info-bar');
  if (infoBar) infoBar.style.display = 'none'; // collapsed by default

  const lc = document.getElementById('lc');
  lc.removeAttribute('style');
  lc.className = 'fake-app fill-height' + (lv.isAI ? ' ai-app' : '');
  lc.innerHTML = '';
  lc.removeAttribute('style');

  if (lv.isAI) {
    lc.innerHTML = '<div class="ai-banner"><div class="ai-pulse"></div>NexusAI personalization engine — active</div>';
  }

  lv.render(lc);
  renderScore();
  renderStreak();
  renderDots('dots-l');
}

// ── Debrief screen ────────────────────────────────────────────────────────────
function showDebrief(won) {
  setScr('debrief');
  const lv  = LEVELS[levelIdx];
  const pct = levelScores[levelIdx] ?? 0;

  document.getElementById('db-tag').textContent  = lv.isAI ? 'Hyper pattern identified' : 'Pattern identified';
  const nm = document.getElementById('db-name');
  nm.textContent = lv.pattern;
  nm.className   = 'db-name' + (lv.isAI ? ' db-ai' : '');

  document.getElementById('db-desc').textContent = lv.brief;

  const pctColor = pct === 100 ? '#27500A' : pct >= 60 ? '#854F0B' : '#A32D2D';
  const pctBg    = pct === 100 ? '#EAF3DE' : pct >= 60 ? '#FAEEDA' : '#FCEBEB';
  const gradeEl  = document.getElementById('db-grade');
  if (gradeEl) {
    gradeEl.textContent      = pct + '%';
    gradeEl.style.background = pctBg;
    gradeEl.style.color      = pctColor;
  }

  const dr = document.getElementById('db-result');
  if (won) {
    const attempts = levelAttempts;
    if (attempts === 0) {
      dr.textContent  = '✓ First try';
      dr.className    = 'db-result good';
    } else {
      dr.textContent  = `✓ Done in ${attempts + 1} attempt${attempts + 1 !== 1 ? 's' : ''}`;
      dr.className    = 'db-result ok';
    }
  }

  // Real-world callout
  const rwEl = document.getElementById('db-rw');
  if (rwEl && lv.rw) {
    rwEl.innerHTML = `
      <div class="rw-card">
        <div class="db-tag">Real-world example</div>
        <div style="font-size:15px;font-weight:600;color:var(--text);margin-top:2px">${lv.rw.company}</div>
        <div class="db-desc" style="font-size:14px;margin-top:4px">${lv.rw.detail}</div>
        ${lv.rw.link ? `<a href="${lv.rw.link}" target="_blank" rel="noopener" class="rw-source">${lv.rw.link}</a>` : ''}
      </div>`;
    rwEl.style.display = '';
  } else if (rwEl) {
    rwEl.style.display = 'none';
  }

  // AI Why card
  const aiCard = document.getElementById('db-ai-card');
  if (aiCard) {
    if (lv.isAI && lv.aiWhy) {
      aiCard.style.display = '';
      const t = document.getElementById('db-ai-why');
      if (t) t.textContent = lv.aiWhy;
    } else {
      aiCard.style.display = 'none';
    }
  }

  // Dollars card
  const costEl = document.getElementById('db-cost');
  if (costEl && lv.dollars) {
    const d = lv.dollars;
    const amtStr = d.amount > 0
      ? `$${d.amount.toFixed(2)}${d.period ? '/' + d.period : ''}`
      : 'No direct cost';
    costEl.innerHTML = `
      <div class="db-tag" style="margin-bottom:6px">Cost if you fell for it</div>
      <div style="font-size:13px;color:var(--text2)">${d.label}</div>
      <div style="font-size:20px;font-weight:600;color:#ff9090;margin-top:4px">${amtStr}</div>
      ${d.note ? `<div style="font-size:13px;color:var(--text3);margin-top:3px">${d.note}</div>` : ''}`;
  }

  // Replay steps
  const replayEl = document.getElementById('db-replay');
  if (replayEl && lv.replay) {
    replayEl.innerHTML = `
      <div class="replay-title">What just happened</div>
      ${lv.replay.map(s => `
        <div class="replay-step">
          <span class="replay-flag">${s.trap ? '🚩' : '✓'}</span>
          <span class="replay-step-body">${s.note}</span>
        </div>`).join('')}`;
    replayEl.style.display = '';
  }

  // Next button label
  const nextBtn = document.getElementById('db-next-btn');
  if (nextBtn) {
    nextBtn.textContent = levelIdx >= LEVELS.length - 1 ? 'See results →' : 'Next level →';
  }
}

// ── Win screen ────────────────────────────────────────────────────────────────
function showWin() {
  setScr('win');
  document.getElementById('win-score').textContent  = score;
  document.getElementById('win-levels').textContent = LEVELS.length;

  const summary = document.getElementById('win-summary');
  if (summary) {
    summary.innerHTML = LEVELS.map((lv, i) => {
      const pct = levelScores[i] ?? 0;
      const color = pct === 100 ? '#39d98a' : pct >= 60 ? '#f5a623' : '#ff4f4f';
      return `<div class="receipt-row"><span>${lv.pattern}</span><span style="color:${color}">${pct}%</span></div>`;
    }).join('');
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────
function next() {
  levelIdx++;
  if (levelIdx >= LEVELS.length) { showWin(); return; }
  showBrief();
}

function jumpTo(idx) {
  score         = 0;
  streak        = 0;
  levelIdx      = idx;
  levelAttempts = 0;
  levelScores   = [];
  hoverTimers   = {};
  hintState     = {};
  showBrief();
}

// ── Start ─────────────────────────────────────────────────────────────────────
function start() {
  score         = 0;
  streak        = 0;
  levelIdx      = 0;
  hoverTimers   = {};
  levelScores   = [];
  levelAttempts = 0;
  hintState     = {};
  showBrief();
}

// ── Public G object (used by level render functions) ──────────────────────────
const G = {
  start,
  next,
  jumpTo,
  succeed,
  fail,
  showHint,
  showLevel,
  getLevelAttempts,
  beginLevel: () => showLevel(),
  setScr,
  _levelIdx: () => levelIdx,
  toggleInfo() {
    const bar = document.getElementById('h-info-bar');
    if (bar) bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
  },
};

// Make G and almostGotYou available globally (level files call them directly)
window.G = G;
window.almostGotYou = almostGotYou;

// ── LEVELS array (assigned after ES module imports resolve) ───────────────────
// Set by index-mini.html after importing level files.
let LEVELS = [];
function setLevels(arr) {
  LEVELS = arr;
}

export { G, start, showBrief, showLevel, showDebrief, showWin, next, succeed, fail, almostGotYou, setLevels, renderDots };