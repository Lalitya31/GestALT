/* G4FigureGround.js — Figure/Ground Law game */
(function () {
  'use strict';

  // ── Challenge definitions ──────────────────────────────────────
  // Each challenge defines a scene to draw and the correct figure/ground map
  const CHALLENGES = [
    { id: 1,  label: 'Simple Circle',       draw: drawSimpleCircle,    correct: correctSimpleCircle    },
    { id: 2,  label: 'Rectangle on Field',  draw: drawRectOnField,     correct: correctRectOnField     },
    { id: 3,  label: 'Text on Background',  draw: drawTextScene,       correct: correctTextScene       },
    { id: 4,  label: 'Rubin\'s Vase',       draw: drawRubinsVase,      correct: correctRubinsVase, ambiguous: true },
    { id: 5,  label: 'Ambiguous Faces',     draw: drawAmbiguousFaces,  correct: correctAmbiguousFaces, ambiguous: true },
    { id: 6,  label: 'UI Card',             draw: drawUICard,          correct: correctUICard          },
    { id: 7,  label: 'Modal Dialog',        draw: drawModal,           correct: correctModal           },
    { id: 8,  label: 'Dark UI Screen',      draw: drawDarkUI,          correct: correctDarkUI          },
    { id: 9,  label: 'Overlapping Panels',  draw: drawOverlap,         correct: correctOverlap         },
    { id: 10, label: 'Complex Dashboard',   draw: drawDashboard,       correct: correctDashboard       },
  ];

  const W = 560, H = 380;

  let state = {
    challengeIdx: 0,
    scores: [],
    paintMode: 'figure',
    brushSize: 15,
    isPainting: false,
    vera: null,
    showingDebrief: false,
    sceneCanvas: null,
    paintCanvas: null,
    sCtx: null,
    pCtx: null,
  };

  function init() {
    document.getElementById('g4Brief').addEventListener('click', startGame);
    document.getElementById('g4TheoryToggle').addEventListener('click', () => {
      document.getElementById('g4Theory').classList.toggle('collapsed');
    });
    document.getElementById('g4Next').addEventListener('click', nextChallenge);
    document.getElementById('g4Return').addEventListener('click', () => window.returnToDashboard());
    document.getElementById('g4Submit').addEventListener('click', submitChallenge);
    document.getElementById('g4Clear').addEventListener('click', clearPaint);

    // Paint mode buttons
    document.getElementById('g4FigureBtn').addEventListener('click', () => setPaintMode('figure'));
    document.getElementById('g4GroundBtn').addEventListener('click', () => setPaintMode('ground'));

    // Brush size
    document.querySelectorAll('#g4Theory .eraser-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#g4Theory .eraser-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.brushSize = parseInt(btn.dataset.size);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.key === 'f' || e.key === 'F') setPaintMode('figure');
      if (e.key === 'g' || e.key === 'G') setPaintMode('ground');
    });

    state.sceneCanvas = document.getElementById('g4SceneCanvas');
    state.paintCanvas = document.getElementById('g4PaintCanvas');
    state.sCtx = state.sceneCanvas.getContext('2d');
    state.pCtx = state.paintCanvas.getContext('2d');

    state.sceneCanvas.width  = W;
    state.sceneCanvas.height = H;
    state.paintCanvas.width  = W;
    state.paintCanvas.height = H;

    setupPaintEvents();

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g4VeraOrb',
      commentId: 'g4VeraComment',
      hintQuestion: 'Which element has the highest contrast against its surroundings?',
      interventionText: 'High contrast edges define figure — the eye follows the boundary.',
    });
  }

  function startGame() {
    const brief = document.getElementById('g4Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 400);
    document.getElementById('g4Header').style.display = 'flex';
    document.getElementById('g4Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.challengeIdx = idx;
    state.showingDebrief = false;
    const ch = CHALLENGES[idx];

    document.getElementById('g4Counter').textContent =
      `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;

    // Draw scene
    state.sCtx.clearRect(0, 0, W, H);
    ch.draw(state.sCtx, W, H);

    // Clear paint layer
    clearPaint();

    state.vera.updateCommentary('paint FIGURE (F) and GROUND (G) regions');
    if (ch.ambiguous) {
      state.vera.updateCommentary('ambiguous scene — both interpretations are valid');
    }
  }

  function setPaintMode(mode) {
    state.paintMode = mode;
    document.getElementById('g4FigureBtn').classList.toggle('active', mode === 'figure');
    document.getElementById('g4GroundBtn').classList.toggle('active', mode === 'ground');
  }

  function clearPaint() {
    state.pCtx.clearRect(0, 0, W, H);
  }

  // ── Paint events ───────────────────────────────────────────────
  function setupPaintEvents() {
    const pc = state.paintCanvas;
    pc.addEventListener('mousedown', e => { state.isPainting = true; paint(e); });
    pc.addEventListener('mousemove', e => { if (state.isPainting) paint(e); });
    pc.addEventListener('mouseup',   () => { state.isPainting = false; });
    pc.addEventListener('mouseleave',() => { state.isPainting = false; });
  }

  function paint(e) {
    const rect = state.paintCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top)  * (H / rect.height);

    state.pCtx.beginPath();
    state.pCtx.arc(x, y, state.brushSize, 0, Math.PI * 2);
    if (state.paintMode === 'figure') {
      state.pCtx.fillStyle = 'rgba(99,102,241,0.35)';
    } else {
      state.pCtx.fillStyle = 'rgba(0,0,0,0.4)';
    }
    state.pCtx.fill();
    state.vera.resetTimer();
  }

  // ── Submit ─────────────────────────────────────────────────────
  function submitChallenge() {
    if (state.showingDebrief) return;
    state.showingDebrief = true;

    const ch = CHALLENGES[state.challengeIdx];
    const score = ch.ambiguous ? scoreAmbiguous() : scoreChallenge(ch);
    state.scores.push(score);

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g4Score').textContent = total;
    document.getElementById('g4ScoreRight').textContent = total;

    let good, miss;
    if (ch.ambiguous) {
      good = 'Ambiguous figure-ground — both interpretations are perceptually valid.';
      miss = 'In ambiguous designs, the brain alternates between figure and ground.';
    } else {
      good = score >= 70
        ? `${score}% match — strong figure/ground separation.`
        : `${score}% match — partial separation detected.`;
      miss = score < 70
        ? 'Paint the dominant foreground elements as FIGURE and the receding areas as GROUND.'
        : '';
    }

    document.getElementById('g4DebriefGood').textContent = good;
    document.getElementById('g4DebriefMiss').textContent = miss;

    const overlay = document.getElementById('g4Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('figure/ground separation demonstrated');
  }

  function scoreChallenge(ch) {
    // Sample pixels from paint canvas and compare to correct map
    const paintData   = state.pCtx.getImageData(0, 0, W, H).data;
    const correctData = ch.correct(W, H);

    let matches = 0, total = 0;
    const step = 8; // sample every 8px for performance
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        const i = (y * W + x) * 4;
        const painted = paintData[i + 3] > 20; // has paint
        const isFigure = paintData[i + 2] > 100; // blue channel = indigo = figure
        const correctFig = correctData[y * W + x] === 1;

        if (painted) {
          total++;
          if ((isFigure && correctFig) || (!isFigure && !correctFig)) matches++;
        }
      }
    }
    if (total === 0) return 50;
    return Math.min(100, Math.round((matches / total) * 100));
  }

  function scoreAmbiguous() {
    // Any painted area scores well for ambiguous challenges
    const paintData = state.pCtx.getImageData(0, 0, W, H).data;
    let painted = 0;
    for (let i = 3; i < paintData.length; i += 4) {
      if (paintData[i] > 20) painted++;
    }
    const coverage = painted / (W * H);
    return coverage > 0.05 ? 85 : 50;
  }

  function nextChallenge() {
    const overlay = document.getElementById('g4Debrief');
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
    saved['G04'] = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('gestalt_game_scores', JSON.stringify(saved));

    const prog = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!prog.completedGames) prog.completedGames = [];
    if (!prog.completedGames.includes('G04')) prog.completedGames.push('G04');
    prog.totalXP = (prog.totalXP || 0) + xp;
    if (!prog.skillLevels) prog.skillLevels = {};
    prog.skillLevels.gestalt = Math.min(100, (prog.skillLevels.gestalt || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(prog));

    document.getElementById('g4XP').textContent = `+${xp} XP`;
    document.getElementById('g4PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g4Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));

    const el = document.getElementById('g4FinalScore');
    let cur = 0;
    const step = Math.ceil(avg / 60);
    const counter = setInterval(() => {
      cur = Math.min(cur + step, avg);
      el.textContent = cur;
      if (cur >= avg) clearInterval(counter);
    }, 16);
  }

  // ── Scene drawing functions ────────────────────────────────────
  function drawSimpleCircle(ctx, w, h) {
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2);
    ctx.fillStyle = '#E0E0FF';
    ctx.fill();
  }
  function correctSimpleCircle(w, h) {
    const map = new Uint8Array(w * h);
    const cx = w / 2, cy = h / 2;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      map[y * w + x] = Math.hypot(x - cx, y - cy) < 80 ? 1 : 0;
    }
    return map;
  }

  function drawRectOnField(ctx, w, h) {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(w * 0.25, h * 0.2, w * 0.5, h * 0.6);
  }
  function correctRectOnField(w, h) {
    const map = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      map[y * w + x] = (x > w * 0.25 && x < w * 0.75 && y > h * 0.2 && y < h * 0.8) ? 1 : 0;
    }
    return map;
  }

  function drawTextScene(ctx, w, h) {
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#E0E0FF';
    ctx.font = 'bold 48px Fraunces, serif';
    ctx.textAlign = 'center';
    ctx.fillText('GESTALT', w / 2, h / 2 + 16);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('perception is everything', w / 2, h / 2 + 48);
  }
  function correctTextScene(w, h) {
    // Text area is figure
    const map = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      map[y * w + x] = (y > h * 0.3 && y < h * 0.75 && x > w * 0.1 && x < w * 0.9) ? 1 : 0;
    }
    return map;
  }

  function drawRubinsVase(ctx, w, h) {
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, w, h);
    // Vase / two faces silhouette
    ctx.fillStyle = '#E0E0FF';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.1);
    ctx.bezierCurveTo(w * 0.7, h * 0.1, w * 0.8, h * 0.3, w * 0.75, h * 0.5);
    ctx.bezierCurveTo(w * 0.8, h * 0.7, w * 0.7, h * 0.9, w * 0.5, h * 0.9);
    ctx.bezierCurveTo(w * 0.3, h * 0.9, w * 0.2, h * 0.7, w * 0.25, h * 0.5);
    ctx.bezierCurveTo(w * 0.2, h * 0.3, w * 0.3, h * 0.1, w * 0.5, h * 0.1);
    ctx.fill();
    // Faces (dark)
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.5, 0);
    ctx.bezierCurveTo(w * 0.3, h * 0.1, w * 0.2, h * 0.3, w * 0.25, h * 0.5);
    ctx.bezierCurveTo(w * 0.2, h * 0.7, w * 0.3, h * 0.9, w * 0.5, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w * 0.5, 0);
    ctx.bezierCurveTo(w * 0.7, h * 0.1, w * 0.8, h * 0.3, w * 0.75, h * 0.5);
    ctx.bezierCurveTo(w * 0.8, h * 0.7, w * 0.7, h * 0.9, w * 0.5, h);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }
  function correctRubinsVase(w, h) {
    // Ambiguous — centre vase region
    const map = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      map[y * w + x] = (x > w * 0.25 && x < w * 0.75) ? 1 : 0;
    }
    return map;
  }

  function drawAmbiguousFaces(ctx, w, h) {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);
    // Two overlapping circles creating ambiguity
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#6366F1';
    ctx.beginPath();
    ctx.arc(w * 0.38, h * 0.5, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E0E0FF';
    ctx.beginPath();
    ctx.arc(w * 0.62, h * 0.5, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  function correctAmbiguousFaces(w, h) {
    const map = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const d1 = Math.hypot(x - w * 0.38, y - h * 0.5);
      const d2 = Math.hypot(x - w * 0.62, y - h * 0.5);
      map[y * w + x] = (d1 < 90 || d2 < 90) ? 1 : 0;
    }
    return map;
  }

  function drawUICard(ctx, w, h) {
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, w, h);
    // Card
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.roundRect(w * 0.15, h * 0.1, w * 0.7, h * 0.8, 8);
    ctx.fill();
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(w * 0.15, h * 0.1, w * 0.7, h * 0.25);
    ctx.fillStyle = '#E0E0FF';
    ctx.font = '18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Card Title', w / 2, h * 0.28);
    ctx.fillStyle = '#888';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Card body text goes here', w / 2, h * 0.55);
  }
  function correctUICard(w, h) {
    const map = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      map[y * w + x] = (x > w * 0.15 && x < w * 0.85 && y > h * 0.1 && y < h * 0.9) ? 1 : 0;
    }
    return map;
  }

  function drawModal(ctx, w, h) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.roundRect(w * 0.2, h * 0.15, w * 0.6, h * 0.7, 8);
    ctx.fill();
    ctx.fillStyle = '#E0E0FF';
    ctx.font = 'bold 20px Fraunces, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Modal Title', w / 2, h * 0.32);
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(w * 0.35, h * 0.7, w * 0.3, 36);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Confirm', w / 2, h * 0.73);
  }
  function correctModal(w, h) {
    const map = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      map[y * w + x] = (x > w * 0.2 && x < w * 0.8 && y > h * 0.15 && y < h * 0.85) ? 1 : 0;
    }
    return map;
  }

  function drawDarkUI(ctx, w, h) {
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, w, h);
    // Sidebar
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 120, h);
    // Main content
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(140, 20, w - 160, h - 40);
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(140, 20, w - 160, 50);
    ctx.fillStyle = '#E0E0FF';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Dashboard', 160, 52);
  }
  function correctDarkUI(w, h) {
    const map = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      map[y * w + x] = (x > 140 && x < w - 20 && y > 20 && y < h - 20) ? 1 : 0;
    }
    return map;
  }

  function drawOverlap(ctx, w, h) {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2A2A2A';
    ctx.fillRect(w * 0.05, h * 0.1, w * 0.55, h * 0.8);
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(w * 0.4, h * 0.2, w * 0.55, h * 0.6);
    ctx.fillStyle = '#E0E0FF';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Panel A', w * 0.25, h * 0.5);
    ctx.fillText('Panel B', w * 0.7, h * 0.5);
  }
  function correctOverlap(w, h) {
    const map = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const inB = x > w * 0.4 && x < w * 0.95 && y > h * 0.2 && y < h * 0.8;
      map[y * w + x] = inB ? 1 : 0;
    }
    return map;
  }

  function drawDashboard(ctx, w, h) {
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, w, h);
    // Top bar
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, 48);
    ctx.fillStyle = '#6366F1';
    ctx.font = 'bold 16px Fraunces, serif';
    ctx.textAlign = 'left';
    ctx.fillText('GestALT', 16, 30);
    // Cards
    [[20, 60, 160, 120], [200, 60, 160, 120], [380, 60, 160, 120]].forEach(([x, y, cw, ch]) => {
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(x, y, cw, ch);
      ctx.fillStyle = '#E0E0FF';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Metric', x + cw / 2, y + 30);
      ctx.fillStyle = '#4ADE80';
      ctx.font = 'bold 28px JetBrains Mono, monospace';
      ctx.fillText('99%', x + cw / 2, y + 75);
    });
    // Chart area
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(20, 200, w - 40, h - 220);
  }
  function correctDashboard(w, h) {
    const map = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const inCard1 = x > 20 && x < 180 && y > 60 && y < 180;
      const inCard2 = x > 200 && x < 360 && y > 60 && y < 180;
      const inCard3 = x > 380 && x < 540 && y > 60 && y < 180;
      const inChart = x > 20 && x < w - 20 && y > 200 && y < h - 20;
      map[y * w + x] = (inCard1 || inCard2 || inCard3 || inChart) ? 1 : 0;
    }
    return map;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
