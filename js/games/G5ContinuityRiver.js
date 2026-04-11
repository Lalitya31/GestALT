/* G5ContinuityRiver.js — Continuity Law game */
(function () {
  'use strict';

  // ── Challenge definitions ──────────────────────────────────────
  // expertPath: array of [x%, y%] normalised to layout container
  const CHALLENGES = [
    {
      id: 1, label: 'Single Column Article',
      layout: layoutSingleColumn,
      expertPath: [[50,5],[50,18],[50,32],[50,46],[50,60],[50,74],[50,88]],
    },
    {
      id: 2, label: 'Centered Hero',
      layout: layoutCenteredHero,
      expertPath: [[50,8],[50,22],[50,38],[50,52],[30,65],[70,65],[50,80]],
    },
    {
      id: 3, label: 'Left-Aligned Blog',
      layout: layoutLeftBlog,
      expertPath: [[20,8],[20,20],[20,35],[20,50],[20,65],[20,80]],
    },
    {
      id: 4, label: 'Two-Column Layout',
      layout: layoutTwoColumn,
      expertPath: [[25,8],[25,22],[25,38],[25,55],[75,22],[75,38],[75,55]],
    },
    {
      id: 5, label: 'F-Pattern Page',
      layout: layoutFPattern,
      expertPath: [[10,10],[90,10],[10,30],[60,30],[10,50],[40,50],[10,70]],
    },
    {
      id: 6, label: 'Z-Pattern Landing',
      layout: layoutZPattern,
      expertPath: [[10,10],[90,10],[50,40],[10,70],[90,70]],
    },
    {
      id: 7, label: 'Dashboard Grid',
      layout: layoutDashboard,
      expertPath: [[15,10],[50,10],[85,10],[15,40],[50,40],[85,40],[15,70],[50,70]],
    },
    {
      id: 8, label: 'Complex App Screen',
      layout: layoutAppScreen,
      expertPath: [[50,5],[50,18],[20,35],[80,35],[20,55],[80,55],[50,75],[50,90]],
    },
    {
      id: 9, label: 'Broken Layout',
      layout: layoutBroken,
      expertPath: [[50,5],[50,20],[50,38],[50,55],[50,72],[50,88]],
    },
    {
      id: 10, label: 'E-Commerce Page',
      layout: layoutEcommerce,
      expertPath: [[50,5],[50,18],[20,32],[50,32],[80,32],[20,55],[50,55],[80,55],[50,78]],
    },
  ];

  let state = {
    challengeIdx: 0,
    scores: [],
    points: [],       // user-drawn anchor points [{x,y}]
    vera: null,
    showingDebrief: false,
    drawSvg: null,
    pathSvg: null,
    layoutEl: null,
    containerW: 700,
    containerH: 400,
  };

  function init() {
    document.getElementById('g5Brief').addEventListener('click', startGame);
    document.getElementById('g5TheoryToggle').addEventListener('click', () => {
      document.getElementById('g5Theory').classList.toggle('collapsed');
    });
    document.getElementById('g5Next').addEventListener('click', nextChallenge);
    document.getElementById('g5Return').addEventListener('click', () => window.returnToDashboard());
    document.getElementById('g5Submit').addEventListener('click', submitPath);
    document.getElementById('g5ClearPath').addEventListener('click', clearPath);

    state.drawSvg  = document.getElementById('g5DrawSvg');
    state.pathSvg  = document.getElementById('g5PathSvg');
    state.layoutEl = document.getElementById('g5Layout');

    setupDrawEvents();

    // Keyboard: backspace removes last point
    document.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && document.getElementById('g5Arena').style.display !== 'none') {
        e.preventDefault();
        state.points.pop();
        renderUserPath();
      }
    });

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g5VeraOrb',
      commentId: 'g5VeraComment',
      hintQuestion: 'Where does the largest element draw your eye first?',
      interventionText: 'Follow the visual weight — large elements attract the eye first.',
    });
  }

  function startGame() {
    const brief = document.getElementById('g5Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 400);
    document.getElementById('g5Header').style.display = 'flex';
    document.getElementById('g5Arena').style.display = 'flex';

    // Measure container
    const wrap = document.querySelector('.cont-canvas-wrap');
    if (wrap) {
      state.containerW = wrap.clientWidth  || 700;
      state.containerH = wrap.clientHeight || 400;
    }
    setSvgSize();
    loadChallenge(0);
    state.vera.startTimer();
  }

  function setSvgSize() {
    [state.drawSvg, state.pathSvg].forEach(svg => {
      svg.setAttribute('width',  state.containerW);
      svg.setAttribute('height', state.containerH);
      svg.style.width  = state.containerW + 'px';
      svg.style.height = state.containerH + 'px';
    });
  }

  function loadChallenge(idx) {
    state.challengeIdx = idx;
    state.showingDebrief = false;
    state.points = [];
    const ch = CHALLENGES[idx];

    document.getElementById('g5Counter').textContent =
      `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;

    // Render layout
    state.layoutEl.innerHTML = '';
    ch.layout(state.layoutEl, state.containerW, state.containerH);

    // Clear SVGs
    state.drawSvg.innerHTML = '';
    state.pathSvg.innerHTML = '';
    document.getElementById('g5Replay').style.display = 'none';

    state.vera.updateCommentary('draw the eye-flow path through this layout');
  }

  // ── Draw events ────────────────────────────────────────────────
  function setupDrawEvents() {
    state.drawSvg.addEventListener('click', e => {
      const rect = state.drawSvg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      state.points.push({ x, y });
      renderUserPath();
      state.vera.resetTimer();
    });
  }

  function renderUserPath() {
    state.drawSvg.innerHTML = '';
    const pts = state.points;
    if (pts.length === 0) return;

    // Draw path
    if (pts.length > 1) {
      const d = buildSvgPath(pts);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', '#F59E0B');
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-dasharray', '6 3');
      state.drawSvg.appendChild(path);
    }

    // Draw anchor dots
    pts.forEach((p, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', i === 0 ? 7 : 5);
      circle.setAttribute('fill', i === 0 ? '#6366F1' : '#F59E0B');
      state.drawSvg.appendChild(circle);
    });
  }

  function buildSvgPath(pts) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      const cpy = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x} ${prev.y} ${cpx} ${cpy}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
  }

  function clearPath() {
    state.points = [];
    state.drawSvg.innerHTML = '';
  }

  // ── Submit ─────────────────────────────────────────────────────
  function submitPath() {
    if (state.showingDebrief || state.points.length < 2) {
      if (state.points.length < 2) {
        state.vera.updateCommentary('place at least 2 points to draw a path');
      }
      return;
    }
    state.showingDebrief = true;

    const ch = CHALLENGES[state.challengeIdx];
    const expertPts = ch.expertPath.map(([xp, yp]) => ({
      x: (xp / 100) * state.containerW,
      y: (yp / 100) * state.containerH,
    }));

    const overlap = calcOverlap(state.points, expertPts, 40);
    const score = Math.min(125, Math.round(overlap + (!state.vera.wasHintUsed() ? 15 : 0)));
    state.scores.push(score);

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g5Score').textContent = total;
    document.getElementById('g5ScoreRight').textContent = total;
    document.getElementById('g5Overlap').textContent = Math.round(overlap) + '%';

    // Show expert path
    renderExpertPath(expertPts);
    startReplayAnimation(expertPts, state.points);

    const good = overlap >= 60
      ? `${Math.round(overlap)}% path overlap — your eye-flow matches expert pattern.`
      : `${Math.round(overlap)}% overlap — path diverges from optimal flow.`;
    const miss = overlap < 60
      ? 'Follow visual weight: largest elements first, then secondary, then detail.'
      : '';

    document.getElementById('g5DebriefGood').textContent = good;
    document.getElementById('g5DebriefMiss').textContent = miss;

    const overlay = document.getElementById('g5Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('continuity path analysed');
  }

  function renderExpertPath(pts) {
    state.pathSvg.innerHTML = '';
    if (pts.length < 2) return;
    const d = buildSvgPath(pts);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#6366F1');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.7');
    state.pathSvg.appendChild(path);
  }

  function calcOverlap(userPts, expertPts, tolerance) {
    if (!userPts.length || !expertPts.length) return 0;
    let matches = 0;
    expertPts.forEach(ep => {
      const nearest = userPts.reduce((best, up) => {
        const d = Math.hypot(up.x - ep.x, up.y - ep.y);
        return d < best ? d : best;
      }, Infinity);
      if (nearest < tolerance) matches++;
    });
    return (matches / expertPts.length) * 100;
  }

  function startReplayAnimation(expertPts, userPts) {
    document.getElementById('g5Replay').style.display = 'flex';
    // Simple: animate dots along paths after debrief closes
  }

  function nextChallenge() {
    const overlay = document.getElementById('g5Debrief');
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.style.display = 'none'; }, 400);
    state.showingDebrief = false;
    state.vera.resetTimer();

    const next = state.challengeIdx + 1;
    if (next >= CHALLENGES.length) showComplete();
    else loadChallenge(next);
  }

  function showComplete() {
    const total = state.scores.reduce((a, b) => a + b, 0);
    const avg   = Math.round(total / state.scores.length);
    const xp    = avg * 10;

    const saved = JSON.parse(localStorage.getItem('gestalt_game_scores') || '{}');
    saved['G05'] = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('gestalt_game_scores', JSON.stringify(saved));

    const prog = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!prog.completedGames) prog.completedGames = [];
    if (!prog.completedGames.includes('G05')) prog.completedGames.push('G05');
    prog.totalXP = (prog.totalXP || 0) + xp;
    if (!prog.skillLevels) prog.skillLevels = {};
    prog.skillLevels.gestalt = Math.min(100, (prog.skillLevels.gestalt || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(prog));

    document.getElementById('g5XP').textContent = `+${xp} XP`;
    document.getElementById('g5PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g5Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));

    const el = document.getElementById('g5FinalScore');
    let cur = 0;
    const step = Math.ceil(avg / 60);
    const counter = setInterval(() => {
      cur = Math.min(cur + step, avg);
      el.textContent = cur;
      if (cur >= avg) clearInterval(counter);
    }, 16);
  }

  // ── Layout renderers ───────────────────────────────────────────
  function block(el, styles, text) {
    const d = document.createElement('div');
    Object.assign(d.style, styles);
    if (text) d.textContent = text;
    el.appendChild(d);
    return d;
  }

  function layoutSingleColumn(el, w, h) {
    el.style.cssText = 'padding:16px;display:flex;flex-direction:column;gap:12px;';
    block(el, { height:'32px', background:'#6366F1', borderRadius:'4px' }, '');
    block(el, { height:'20px', background:'#2A2A2A', borderRadius:'3px', width:'70%' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'90%' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'80%' }, '');
    block(el, { height:'20px', background:'#2A2A2A', borderRadius:'3px', width:'60%', marginTop:'8px' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'85%' }, '');
  }

  function layoutCenteredHero(el, w, h) {
    el.style.cssText = 'padding:16px;display:flex;flex-direction:column;align-items:center;gap:12px;';
    block(el, { height:'40px', background:'#6366F1', borderRadius:'4px', width:'60%' }, '');
    block(el, { height:'16px', background:'#2A2A2A', borderRadius:'3px', width:'80%' }, '');
    block(el, { height:'16px', background:'#2A2A2A', borderRadius:'3px', width:'70%' }, '');
    const row = block(el, { display:'flex', gap:'16px', width:'100%', justifyContent:'center', marginTop:'8px' }, '');
    block(row, { height:'80px', background:'#1A1A1A', borderRadius:'4px', flex:'1' }, '');
    block(row, { height:'80px', background:'#1A1A1A', borderRadius:'4px', flex:'1' }, '');
    block(el, { height:'36px', background:'#4ADE80', borderRadius:'4px', width:'40%' }, '');
  }

  function layoutLeftBlog(el, w, h) {
    el.style.cssText = 'padding:16px;display:flex;flex-direction:column;gap:10px;';
    block(el, { height:'28px', background:'#6366F1', borderRadius:'4px', width:'50%' }, '');
    block(el, { height:'12px', background:'#2A2A2A', borderRadius:'2px', width:'30%' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'95%' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'88%' }, '');
    block(el, { height:'20px', background:'#2A2A2A', borderRadius:'3px', width:'45%', marginTop:'8px' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'92%' }, '');
  }

  function layoutTwoColumn(el, w, h) {
    el.style.cssText = 'padding:16px;display:flex;gap:16px;';
    const left = block(el, { flex:'1', display:'flex', flexDirection:'column', gap:'10px' }, '');
    block(left, { height:'24px', background:'#6366F1', borderRadius:'4px' }, '');
    block(left, { height:'12px', background:'#1A1A1A', borderRadius:'2px' }, '');
    block(left, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'90%' }, '');
    block(left, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'80%' }, '');
    const right = block(el, { flex:'1', display:'flex', flexDirection:'column', gap:'10px' }, '');
    block(right, { height:'24px', background:'#2A2A2A', borderRadius:'4px' }, '');
    block(right, { height:'12px', background:'#1A1A1A', borderRadius:'2px' }, '');
    block(right, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'85%' }, '');
    block(right, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'75%' }, '');
  }

  function layoutFPattern(el, w, h) {
    el.style.cssText = 'padding:16px;display:flex;flex-direction:column;gap:8px;';
    block(el, { height:'20px', background:'#6366F1', borderRadius:'3px' }, '');
    block(el, { height:'12px', background:'#2A2A2A', borderRadius:'2px', width:'75%' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'40%' }, '');
    block(el, { height:'20px', background:'#2A2A2A', borderRadius:'3px', marginTop:'8px' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'60%' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'35%' }, '');
    block(el, { height:'20px', background:'#2A2A2A', borderRadius:'3px', marginTop:'8px' }, '');
    block(el, { height:'12px', background:'#1A1A1A', borderRadius:'2px', width:'45%' }, '');
  }

  function layoutZPattern(el, w, h) {
    el.style.cssText = 'padding:16px;display:flex;flex-direction:column;gap:16px;';
    const top = block(el, { display:'flex', justifyContent:'space-between', alignItems:'center' }, '');
    block(top, { height:'24px', background:'#6366F1', borderRadius:'4px', width:'30%' }, '');
    block(top, { height:'24px', background:'#4ADE80', borderRadius:'4px', width:'20%' }, '');
    block(el, { height:'80px', background:'#1A1A1A', borderRadius:'4px' }, '');
    const bot = block(el, { display:'flex', justifyContent:'space-between', alignItems:'center' }, '');
    block(bot, { height:'20px', background:'#2A2A2A', borderRadius:'3px', width:'40%' }, '');
    block(bot, { height:'32px', background:'#6366F1', borderRadius:'4px', width:'25%' }, '');
  }

  function layoutDashboard(el, w, h) {
    el.style.cssText = 'padding:12px;display:flex;flex-direction:column;gap:10px;';
    const top = block(el, { display:'flex', gap:'10px' }, '');
    [1,2,3].forEach(() => block(top, { flex:'1', height:'60px', background:'#1A1A1A', borderRadius:'4px' }, ''));
    const mid = block(el, { display:'flex', gap:'10px' }, '');
    [1,2,3].forEach(() => block(mid, { flex:'1', height:'60px', background:'#1A1A1A', borderRadius:'4px' }, ''));
    const bot = block(el, { display:'flex', gap:'10px' }, '');
    [1,2].forEach(() => block(bot, { flex:'1', height:'60px', background:'#1A1A1A', borderRadius:'4px' }, ''));
  }

  function layoutAppScreen(el, w, h) {
    el.style.cssText = 'padding:12px;display:flex;flex-direction:column;gap:10px;';
    block(el, { height:'36px', background:'#6366F1', borderRadius:'4px' }, '');
    block(el, { height:'20px', background:'#2A2A2A', borderRadius:'3px', width:'60%', margin:'0 auto' }, '');
    const row1 = block(el, { display:'flex', gap:'10px' }, '');
    block(row1, { flex:'1', height:'70px', background:'#1A1A1A', borderRadius:'4px' }, '');
    block(row1, { flex:'1', height:'70px', background:'#1A1A1A', borderRadius:'4px' }, '');
    const row2 = block(el, { display:'flex', gap:'10px' }, '');
    block(row2, { flex:'1', height:'70px', background:'#1A1A1A', borderRadius:'4px' }, '');
    block(row2, { flex:'1', height:'70px', background:'#1A1A1A', borderRadius:'4px' }, '');
    block(el, { height:'32px', background:'#4ADE80', borderRadius:'4px', width:'50%', margin:'0 auto' }, '');
  }

  function layoutBroken(el, w, h) {
    // Intentionally broken flow — random placement
    el.style.cssText = 'padding:12px;position:relative;height:100%;';
    const items = [
      { top:'60%', left:'5%',  width:'30%', height:'20px', bg:'#6366F1' },
      { top:'10%', left:'60%', width:'35%', height:'14px', bg:'#1A1A1A' },
      { top:'30%', left:'20%', width:'20%', height:'28px', bg:'#2A2A2A' },
      { top:'75%', left:'50%', width:'40%', height:'14px', bg:'#1A1A1A' },
      { top:'5%',  left:'10%', width:'25%', height:'14px', bg:'#1A1A1A' },
    ];
    items.forEach(item => {
      block(el, {
        position:'absolute', top:item.top, left:item.left,
        width:item.width, height:item.height,
        background:item.bg, borderRadius:'3px',
      }, '');
    });
  }

  function layoutEcommerce(el, w, h) {
    el.style.cssText = 'padding:12px;display:flex;flex-direction:column;gap:10px;';
    block(el, { height:'28px', background:'#6366F1', borderRadius:'4px' }, '');
    block(el, { height:'16px', background:'#2A2A2A', borderRadius:'3px', width:'50%', margin:'0 auto' }, '');
    const grid = block(el, { display:'flex', gap:'10px' }, '');
    [1,2,3].forEach(() => {
      const card = block(grid, { flex:'1', background:'#1A1A1A', borderRadius:'4px', padding:'8px', display:'flex', flexDirection:'column', gap:'6px' }, '');
      block(card, { height:'50px', background:'#2A2A2A', borderRadius:'3px' }, '');
      block(card, { height:'12px', background:'#333', borderRadius:'2px' }, '');
      block(card, { height:'20px', background:'#4ADE80', borderRadius:'3px', width:'60%' }, '');
    });
    block(el, { height:'32px', background:'#6366F1', borderRadius:'4px', width:'40%', margin:'0 auto' }, '');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
