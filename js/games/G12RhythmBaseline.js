(() => {
  'use strict';

  const CHALLENGES = Array.from({ length: 10 }).map((_, i) => {
    const count = 4 + (i % 4);
    const grid = i >= 7 ? 6 : 8;
    const tolerance = i >= 7 ? 1.5 : (i >= 4 ? 2 : 2.5);
    return {
      id: i + 1,
      name: `Canvas ${i + 1}`,
      count,
      grid,
      tolerance,
      targets: Array.from({ length: count }).map((__, k) => 70 + k * (grid * 5)),
    };
  });

  const state = {
    idx: 0,
    scores: [],
    items: [],
    zoom: false,
    vera: null,
    showingDebrief: false,
  };

  function init() {
    const brief = document.getElementById('g12Brief');
    if (!brief) return;

    brief.addEventListener('click', start);
    document.getElementById('g12TheoryToggle').addEventListener('click', () => {
      document.getElementById('g12Theory').classList.toggle('collapsed');
    });
    document.getElementById('g12Zoom').addEventListener('click', toggleZoom);
    document.getElementById('g12Submit').addEventListener('click', submit);
    document.getElementById('g12Next').addEventListener('click', next);
    document.getElementById('g12Return').addEventListener('click', () => window.returnToDashboard());

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g12VeraOrb',
      commentId: 'g12VeraComment',
      hintQuestion: 'Can you align each text baseline, not just the top of each box?',
      interventionText: 'Read the baseline marker and nudge by single-pixel drags near the end.',
    });
  }

  function start() {
    const brief = document.getElementById('g12Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 350);
    document.getElementById('g12Header').style.display = 'flex';
    document.getElementById('g12Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.idx = idx;
    state.items = [];
    state.showingDebrief = false;

    const ch = CHALLENGES[idx];
    document.getElementById('g12Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
    document.getElementById('g12Scenario').textContent = `${ch.name} baseline ${ch.grid}px grid`;
    document.getElementById('g12Tolerance').textContent = `${ch.tolerance}px`;

    const canvas = document.getElementById('g12Canvas');
    canvas.innerHTML = '';
    drawGrid(canvas, ch.grid);

    for (let i = 0; i < ch.count; i += 1) {
      const node = document.createElement('div');
      node.className = 'rhythm-item';
      node.textContent = `Text block ${i + 1}`;
      node.style.top = `${ch.targets[i] + 24 + (Math.random() * 50 - 25)}px`;
      node.style.left = `${80 + (i % 2) * 260 + (Math.random() * 20 - 10)}px`;
      node.dataset.index = String(i);
      canvas.appendChild(node);

      const marker = document.createElement('div');
      marker.className = 'rhythm-baseline-marker';
      marker.style.top = `${ch.targets[i]}px`;
      marker.textContent = 'baseline';
      canvas.appendChild(marker);

      state.items.push({ id: i, el: node, target: ch.targets[i] });
      makeDraggable(node);
    }

    updateMetrics();
    state.vera.resetTimer();
  }

  function drawGrid(canvas, step) {
    const h = 520;
    for (let y = 0; y < h; y += step) {
      const line = document.createElement('div');
      line.className = 'rhythm-grid-line';
      line.style.top = `${y}px`;
      canvas.appendChild(line);
    }
  }

  function makeDraggable(el) {
    let dragging = false;
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;

    el.addEventListener('pointerdown', e => {
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      ox = parseFloat(el.style.left);
      oy = parseFloat(el.style.top);
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      el.style.left = `${Math.max(20, Math.min(560, ox + dx))}px`;
      el.style.top = `${Math.max(20, Math.min(500, oy + dy))}px`;
      updateMetrics();
    });

    el.addEventListener('pointerup', e => {
      dragging = false;
      el.releasePointerCapture(e.pointerId);
      updateMetrics();
    });
  }

  function toggleZoom() {
    state.zoom = !state.zoom;
    const canvas = document.getElementById('g12Canvas');
    canvas.classList.toggle('zoomed', state.zoom);
    document.getElementById('g12Zoom').textContent = state.zoom ? 'ZOOM ×1' : 'ZOOM ×4';
  }

  function deviation(item) {
    const top = parseFloat(item.el.style.top);
    const baseline = top + 26;
    return Math.abs(baseline - item.target);
  }

  function updateMetrics() {
    const ch = CHALLENGES[state.idx];
    const devs = state.items.map(deviation);
    const avg = devs.length ? devs.reduce((a, b) => a + b, 0) / devs.length : 0;
    const aligned = devs.filter(d => d <= ch.tolerance).length;

    document.getElementById('g12Deviation').textContent = `${avg.toFixed(1)}px`;
    document.getElementById('g12Aligned').textContent = `${aligned}/${devs.length}`;

    if (avg <= ch.tolerance) state.vera.updateCommentary('excellent rhythm - precise baseline lock');
    else if (avg <= ch.tolerance * 1.6) state.vera.updateCommentary('close. refine baseline, not visual top edges');
    else state.vera.updateCommentary('large baseline drift detected');
  }

  function submit() {
    if (state.showingDebrief) return;
    const ch = CHALLENGES[state.idx];
    const devs = state.items.map(deviation);
    const avg = devs.length ? devs.reduce((a, b) => a + b, 0) / devs.length : 0;
    const aligned = devs.filter(d => d <= ch.tolerance).length;

    const precision = clamp(1 - avg / (ch.tolerance * 3), 0, 1);
    const alignRatio = state.items.length ? aligned / state.items.length : 0;
    let score = Math.round((precision * 0.55 + alignRatio * 0.45) * 100);
    if (!state.vera.wasHintUsed()) score += 10;
    score = clamp(score, 0, 125);

    state.scores.push(score);
    state.showingDebrief = true;

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g12Score').textContent = String(total);

    document.getElementById('g12DebriefGood').textContent =
      `Avg deviation ${avg.toFixed(1)}px. Aligned ${aligned}/${state.items.length} within ${ch.tolerance}px.`;
    document.getElementById('g12DebriefMiss').textContent =
      avg > ch.tolerance ? 'Text baselines drift. Zoom in and align by baseline marker, not box top.' : 'Strong rhythm. Your lines now read as one system.';

    const overlay = document.getElementById('g12Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('baseline calibrated');
  }

  function next() {
    const overlay = document.getElementById('g12Debrief');
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.style.display = 'none'; }, 280);
    state.showingDebrief = false;

    const nextIdx = state.idx + 1;
    if (nextIdx >= CHALLENGES.length) {
      showComplete();
      return;
    }
    loadChallenge(nextIdx);
  }

  function showComplete() {
    const total = state.scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / state.scores.length);
    const xp = avg * 10;

    const saved = JSON.parse(localStorage.getItem('typography_game_scores') || '{}');
    saved.G12 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('typography_game_scores', JSON.stringify(saved));

    const progress = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!progress.completedGames) progress.completedGames = [];
    if (!progress.completedGames.includes('G12')) progress.completedGames.push('G12');
    progress.totalXP = (progress.totalXP || 0) + xp;
    if (!progress.skillLevels) progress.skillLevels = {};
    progress.skillLevels.typography = Math.min(100, (progress.skillLevels.typography || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(progress));

    document.getElementById('g12FinalScore').textContent = String(avg);
    document.getElementById('g12XP').textContent = `+${xp} XP`;
    document.getElementById('g12PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g12Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
