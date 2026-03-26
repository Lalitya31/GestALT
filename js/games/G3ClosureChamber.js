/* G3ClosureChamber.js — Closure Law game */
(function () {
  'use strict';

  // ── Challenge definitions ──────────────────────────────────────
  // type: 'recognition' = YES/NO, 'erase' = canvas eraser
  const CHALLENGES = [
    { id: 1,  label: 'Play Button',    type: 'recognition', willClose: true,  draw: drawPlayBtn,    answer: true  },
    { id: 2,  label: 'Home Icon',      type: 'recognition', willClose: true,  draw: drawHomeIcon,   answer: true  },
    { id: 3,  label: 'Search Icon',    type: 'recognition', willClose: true,  draw: drawSearch,     answer: true  },
    { id: 4,  label: 'Checkbox',       type: 'recognition', willClose: true,  draw: drawCheckbox,   answer: true  },
    { id: 5,  label: 'Toggle',         type: 'recognition', willClose: false, draw: drawBrokenToggle, answer: false },
    { id: 6,  label: 'Logo Mark',      type: 'recognition', willClose: true,  draw: drawLogoMark,   answer: true  },
    { id: 7,  label: 'Settings Gear',  type: 'recognition', willClose: true,  draw: drawGear,       answer: true  },
    { id: 8,  label: 'Bell Icon',      type: 'recognition', willClose: true,  draw: drawBell,       answer: true  },
    { id: 9,  label: 'Erase Play Btn', type: 'erase',       draw: drawPlayBtnFull },
    { id: 10, label: 'Erase Home Icon',type: 'erase',       draw: drawHomeIconFull },
  ];

  let state = {
    challengeIdx: 0,
    scores: [],
    eraseSize: 10,
    isErasing: false,
    vera: null,
    showingDebrief: false,
    eraseCanvas: null,
    eraseCtx: null,
    origCanvas: null,
    origCtx: null,
  };

  function init() {
    document.getElementById('g3Brief').addEventListener('click', startGame);
    document.getElementById('g3TheoryToggle').addEventListener('click', () => {
      document.getElementById('g3Theory').classList.toggle('collapsed');
    });
    document.getElementById('g3Next').addEventListener('click', nextChallenge);
    document.getElementById('g3Return').addEventListener('click', () => window.returnToDashboard());
    document.getElementById('g3Yes').addEventListener('click', () => submitRecognition(true));
    document.getElementById('g3No').addEventListener('click',  () => submitRecognition(false));
    document.getElementById('g3SubmitErase').addEventListener('click', submitErase);
    document.getElementById('g3Reset').addEventListener('click', resetEraseCanvas);

    // Eraser size buttons
    document.querySelectorAll('.eraser-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.eraser-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.eraseSize = parseInt(btn.dataset.size);
      });
    });

    state.eraseCanvas = document.getElementById('g3EraseCanvas');
    state.eraseCtx    = state.eraseCanvas.getContext('2d');
    state.origCanvas  = document.getElementById('g3OrigCanvas');
    state.origCtx     = state.origCanvas.getContext('2d');

    setupEraseEvents();

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g3VeraOrb',
      commentId: 'g3VeraComment',
      hintQuestion: 'How much of the shape is still visible?',
      interventionText: 'Closure activates at ~60% visible — the brain fills the rest.',
    });
  }

  function startGame() {
    const brief = document.getElementById('g3Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 400);
    document.getElementById('g3Header').style.display = 'flex';
    document.getElementById('g3Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.challengeIdx = idx;
    state.showingDebrief = false;
    const ch = CHALLENGES[idx];

    document.getElementById('g3Counter').textContent =
      `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;

    if (ch.type === 'recognition') {
      document.getElementById('g3ModeA').style.display = 'flex';
      document.getElementById('g3ModeA').style.flexDirection = 'column';
      document.getElementById('g3ModeA').style.alignItems = 'center';
      document.getElementById('g3ModeB').style.display = 'none';
      document.getElementById('g3EraserControls').style.display = 'none';

      // Draw shape in display div via canvas
      const display = document.getElementById('g3Display');
      display.innerHTML = '<canvas id="g3RecogCanvas" width="200" height="200"></canvas>';
      const rc = document.getElementById('g3RecogCanvas');
      rc.style.background = 'transparent';
      const rCtx = rc.getContext('2d');
      ch.draw(rCtx, 200, 200);

      document.getElementById('g3Instruction').textContent =
        `Will the brain complete this shape? (${ch.label})`;
      state.vera.updateCommentary('recognition challenge — trust your instinct');
    } else {
      document.getElementById('g3ModeA').style.display = 'none';
      document.getElementById('g3ModeB').style.display = 'flex';
      document.getElementById('g3ModeB').style.flexDirection = 'column';
      document.getElementById('g3ModeB').style.alignItems = 'center';
      document.getElementById('g3EraserControls').style.display = 'block';

      // Draw original
      state.origCtx.clearRect(0, 0, 200, 200);
      ch.draw(state.origCtx, 200, 200);

      // Copy to erase canvas
      resetEraseCanvas();
      state.vera.updateCommentary('erase as much as possible — keep it recognisable');
    }
  }

  function resetEraseCanvas() {
    const ch = CHALLENGES[state.challengeIdx];
    state.eraseCtx.clearRect(0, 0, 200, 200);
    if (ch.draw) ch.draw(state.eraseCtx, 200, 200);
    updateRecognitionMeter();
  }

  // ── Erase events ───────────────────────────────────────────────
  function setupEraseEvents() {
    const ec = state.eraseCanvas;
    ec.addEventListener('mousedown', e => { state.isErasing = true; erase(e); });
    ec.addEventListener('mousemove', e => { if (state.isErasing) erase(e); });
    ec.addEventListener('mouseup',   () => { state.isErasing = false; });
    ec.addEventListener('mouseleave',() => { state.isErasing = false; });
  }

  function erase(e) {
    const rect = state.eraseCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    state.eraseCtx.save();
    state.eraseCtx.globalCompositeOperation = 'destination-out';
    state.eraseCtx.beginPath();
    state.eraseCtx.arc(x, y, state.eraseSize, 0, Math.PI * 2);
    state.eraseCtx.fill();
    state.eraseCtx.restore();
    updateRecognitionMeter();
  }

  function updateRecognitionMeter() {
    const data = state.eraseCtx.getImageData(0, 0, 200, 200).data;
    let visible = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 10) visible++;
    }
    const total = 200 * 200;
    const pct = Math.round((visible / total) * 100);
    document.getElementById('g3RecBar').style.width = pct + '%';
    document.getElementById('g3RecVal').textContent = pct + '%';
    state.vera.updateCommentary(
      pct > 80 ? 'still very visible — erase more'
      : pct > 50 ? 'closure zone — brain can still complete this'
      : pct > 30 ? 'minimal form — testing the limit'
      : 'almost gone — can the brain still see it?'
    );
  }

  // ── Submit recognition ─────────────────────────────────────────
  function submitRecognition(userAnswer) {
    if (state.showingDebrief) return;
    state.showingDebrief = true;
    const ch = CHALLENGES[state.challengeIdx];
    const correct = userAnswer === ch.answer;
    if (!correct) state.vera.wrongAttempt();

    const score = correct ? 100 : 60;
    state.scores.push(score);
    updateScoreDisplay();

    const good = correct
      ? `Correct — your perceptual judgment matched the principle.`
      : `Incorrect — the brain ${ch.answer ? 'would' : 'would not'} complete this shape.`;
    const miss = !correct
      ? (ch.answer ? 'Enough visual cues remain for closure to activate.' : 'Too many gaps — closure fails without sufficient visual anchors.')
      : '';

    showDebrief(good, miss);
  }

  // ── Submit erase ───────────────────────────────────────────────
  function submitErase() {
    if (state.showingDebrief) return;
    state.showingDebrief = true;

    const data = state.eraseCtx.getImageData(0, 0, 200, 200).data;
    let visible = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 10) visible++;
    }
    const pct = Math.round((visible / (200 * 200)) * 100);

    // Score: reward for erasing a lot while keeping recognisable
    // Ideal: 30–60% visible
    let score;
    if (pct >= 30 && pct <= 60) score = 100;
    else if (pct < 30) score = Math.max(40, 100 - (30 - pct) * 2);
    else score = Math.max(40, 100 - (pct - 60) * 2);

    if (!state.vera.wasHintUsed()) score = Math.min(125, score + 15);
    state.scores.push(score);
    updateScoreDisplay();

    const good = pct <= 60
      ? `Erased ${100 - pct}% — closure still active at ${pct}% visible.`
      : `Shape is ${pct}% visible — try erasing more next time.`;
    const miss = pct > 60
      ? 'The goal is to erase as much as possible while keeping the shape recognisable (~30–60% visible).'
      : '';

    showDebrief(good, miss);
  }

  function updateScoreDisplay() {
    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g3Score').textContent = total;
    document.getElementById('g3ScoreRight').textContent = total;
  }

  function showDebrief(good, miss) {
    document.getElementById('g3DebriefGood').textContent = good;
    document.getElementById('g3DebriefMiss').textContent = miss;
    const overlay = document.getElementById('g3Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('closure principle demonstrated');
  }

  function nextChallenge() {
    const overlay = document.getElementById('g3Debrief');
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
    saved['G03'] = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('gestalt_game_scores', JSON.stringify(saved));

    const prog = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!prog.completedGames) prog.completedGames = [];
    if (!prog.completedGames.includes('G03')) prog.completedGames.push('G03');
    prog.totalXP = (prog.totalXP || 0) + xp;
    if (!prog.skillLevels) prog.skillLevels = {};
    prog.skillLevels.gestalt = Math.min(100, (prog.skillLevels.gestalt || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(prog));

    document.getElementById('g3XP').textContent = `+${xp} XP`;
    document.getElementById('g3PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g3Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));

    const el = document.getElementById('g3FinalScore');
    let cur = 0;
    const step = Math.ceil(avg / 60);
    const counter = setInterval(() => {
      cur = Math.min(cur + step, avg);
      el.textContent = cur;
      if (cur >= avg) clearInterval(counter);
    }, 16);
  }

  // ── Shape drawing functions ────────────────────────────────────
  function drawPlayBtn(ctx, w, h) {
    ctx.strokeStyle = '#E0E0FF';
    ctx.lineWidth = 3;
    // Partial triangle (play button outline, missing one side)
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.2);
    ctx.lineTo(w * 0.3, h * 0.8);
    ctx.lineTo(w * 0.8, h * 0.5);
    // Leave gap — don't close
    ctx.stroke();
  }

  function drawPlayBtnFull(ctx, w, h) {
    ctx.fillStyle = '#6366F1';
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.2);
    ctx.lineTo(w * 0.3, h * 0.8);
    ctx.lineTo(w * 0.8, h * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  function drawHomeIcon(ctx, w, h) {
    ctx.strokeStyle = '#E0E0FF';
    ctx.lineWidth = 3;
    // Roof (partial)
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.5);
    ctx.lineTo(w * 0.5, h * 0.15);
    ctx.lineTo(w * 0.8, h * 0.5);
    ctx.stroke();
    // Door (partial)
    ctx.beginPath();
    ctx.moveTo(w * 0.4, h * 0.85);
    ctx.lineTo(w * 0.4, h * 0.6);
    ctx.lineTo(w * 0.6, h * 0.6);
    ctx.stroke();
  }

  function drawHomeIconFull(ctx, w, h) {
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.5);
    ctx.lineTo(w * 0.5, h * 0.15);
    ctx.lineTo(w * 0.8, h * 0.5);
    ctx.lineTo(w * 0.75, h * 0.5);
    ctx.lineTo(w * 0.75, h * 0.85);
    ctx.lineTo(w * 0.25, h * 0.85);
    ctx.lineTo(w * 0.25, h * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(w * 0.4, h * 0.6, w * 0.2, h * 0.25);
    ctx.stroke();
  }

  function drawSearch(ctx, w, h) {
    ctx.strokeStyle = '#E0E0FF';
    ctx.lineWidth = 3;
    // Circle (partial — 270 degrees)
    ctx.beginPath();
    ctx.arc(w * 0.42, h * 0.42, w * 0.22, 0.8, Math.PI * 2 * 0.9);
    ctx.stroke();
    // Handle
    ctx.beginPath();
    ctx.moveTo(w * 0.6, h * 0.6);
    ctx.lineTo(w * 0.78, h * 0.78);
    ctx.stroke();
  }

  function drawCheckbox(ctx, w, h) {
    ctx.strokeStyle = '#E0E0FF';
    ctx.lineWidth = 3;
    // Box (3 sides only)
    ctx.beginPath();
    ctx.moveTo(w * 0.25, h * 0.25);
    ctx.lineTo(w * 0.25, h * 0.75);
    ctx.lineTo(w * 0.75, h * 0.75);
    ctx.lineTo(w * 0.75, h * 0.25);
    ctx.stroke();
    // Checkmark
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.5);
    ctx.lineTo(w * 0.47, h * 0.63);
    ctx.lineTo(w * 0.68, h * 0.37);
    ctx.stroke();
  }

  function drawBrokenToggle(ctx, w, h) {
    ctx.strokeStyle = '#E0E0FF';
    ctx.lineWidth = 3;
    // Scattered arcs — not recognisable as toggle
    ctx.beginPath();
    ctx.arc(w * 0.3, h * 0.5, 15, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.3, 10, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.2);
    ctx.lineTo(w * 0.6, h * 0.8);
    ctx.stroke();
  }

  function drawLogoMark(ctx, w, h) {
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 4;
    // G shape (partial)
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.5, w * 0.3, 0.3, Math.PI * 1.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.5);
    ctx.lineTo(w * 0.8, h * 0.5);
    ctx.stroke();
  }

  function drawGear(ctx, w, h) {
    ctx.strokeStyle = '#E0E0FF';
    ctx.lineWidth = 2;
    const cx = w / 2, cy = h / 2;
    // Partial gear teeth
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const x1 = cx + 28 * Math.cos(a);
      const y1 = cy + 28 * Math.sin(a);
      const x2 = cx + 38 * Math.cos(a);
      const y2 = cy + 38 * Math.sin(a);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    // Inner circle (partial)
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 1.5);
    ctx.stroke();
  }

  function drawBell(ctx, w, h) {
    ctx.strokeStyle = '#E0E0FF';
    ctx.lineWidth = 3;
    // Bell body (partial arc)
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.4, w * 0.25, Math.PI, 0);
    ctx.stroke();
    // Sides (partial)
    ctx.beginPath();
    ctx.moveTo(w * 0.25, h * 0.4);
    ctx.lineTo(w * 0.2, h * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.75, h * 0.4);
    ctx.lineTo(w * 0.8, h * 0.7);
    ctx.stroke();
    // Clapper dot
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.78, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#E0E0FF';
    ctx.fill();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
