(function () {
  'use strict';

  const A = 0.08;
  const B = 0.12;

  const CHALLENGES = [
    { id: 1, scenario: 'Search -> Select -> Confirm', steps: ['Search', 'Select', 'Confirm'], target: 0.30 },
    { id: 2, scenario: 'Browse -> Select -> Confirm', steps: ['Browse', 'Select', 'Confirm'], target: 0.30 },
    { id: 3, scenario: 'Form fill (5 inputs + submit)', steps: ['Name', 'Email', 'Phone', 'Address', 'Zip', 'Submit'], target: 0.34 },
    { id: 4, scenario: 'Form fill II', steps: ['First', 'Last', 'Email', 'Role', 'Team', 'Submit'], target: 0.34 },
    { id: 5, scenario: 'Mobile flow (44x44 minimum)', steps: ['Search', 'Add', 'Cart', 'Pay'], target: 0.32, mobileMin: 44 },
    { id: 6, scenario: 'Mobile checkout', steps: ['Item', 'Add', 'Address', 'Pay'], target: 0.32, mobileMin: 44 },
    { id: 7, scenario: 'Game controller UI', steps: ['Move', 'Aim', 'Act', 'Confirm'], target: 0.33 },
    { id: 8, scenario: 'Dual-hand control map', steps: ['Left', 'Right', 'Action', 'Menu'], target: 0.33 },
    { id: 9, scenario: 'Left-handed mode', steps: ['Primary', 'Secondary', 'Submit'], target: 0.28, leftHanded: true },
    { id: 10, scenario: 'Motor impairment accessibility', steps: ['Open', 'Select', 'Confirm'], target: 0.27, accessibility: true },
  ];

  let state = {
    idx: 0,
    scores: [],
    elements: [],
    selectedId: null,
    placingType: 'button',
    placeCursor: null,
    startTime: 0,
    vera: null,
    showingDebrief: false,
    simulationTimer: null,
    drag: null,
  };

  function init() {
    document.getElementById('g9Brief').addEventListener('click', startGame);
    document.getElementById('g9TheoryToggle').addEventListener('click', () => {
      document.getElementById('g9Theory').classList.toggle('collapsed');
    });

    document.getElementById('g9AddElement').addEventListener('click', armPlacement);
    document.getElementById('g9Simulate').addEventListener('click', simulateFlow);
    document.getElementById('g9ClearAll').addEventListener('click', clearAll);
    document.getElementById('g9Submit').addEventListener('click', submitLayout);
    document.getElementById('g9Next').addEventListener('click', nextChallenge);
    document.getElementById('g9Return').addEventListener('click', () => window.returnToDashboard());

    document.getElementById('g9Canvas').addEventListener('click', onCanvasClick);

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g9VeraOrb',
      commentId: 'g9VeraComment',
      hintQuestion: 'Which transition currently has the largest distance-to-size ratio?',
      interventionText: 'Increase target size and place the next action closer to the previous one.',
    });
  }

  function startGame() {
    const brief = document.getElementById('g9Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 400);
    document.getElementById('g9Header').style.display = 'flex';
    document.getElementById('g9Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.idx = idx;
    state.elements = [];
    state.selectedId = null;
    state.placeCursor = null;
    state.showingDebrief = false;
    state.startTime = Date.now();
    clearCanvas();

    const ch = CHALLENGES[idx];
    document.getElementById('g9Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
    document.getElementById('g9Scenario').textContent = `Place elements for: ${ch.steps.join(' -> ')}`;
    document.getElementById('g9AvgTime').textContent = '--';
    document.getElementById('g9AvgRight').textContent = '--';

    state.vera.updateCommentary('place flow targets and minimize D/W across steps');
  }

  function armPlacement() {
    state.placingType = document.getElementById('g9ElementType').value;
    const label = document.getElementById('g9ElementLabel').value.trim();
    state.placeCursor = {
      type: state.placingType,
      label: label || `${state.placingType.toUpperCase()} ${state.elements.length + 1}`,
    };
    state.vera.updateCommentary('click canvas to place element');
  }

  function onCanvasClick(e) {
    if (!state.placeCursor) return;

    const canvas = document.getElementById('g9Canvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const el = {
      id: `g9_${Date.now()}_${Math.floor(Math.random() * 999)}`,
      type: state.placeCursor.type,
      label: state.placeCursor.label,
      x: clamp(x, 24, rect.width - 70),
      y: clamp(y, 24, rect.height - 50),
      w: state.placeCursor.type === 'link' ? 72 : 96,
      h: 44,
    };

    state.elements.push(el);
    renderCanvas();
    updateMetrics();
    state.placeCursor = null;
    state.vera.resetTimer();
  }

  function clearAll() {
    state.elements = [];
    clearCanvas();
    updateMetrics();
  }

  function clearCanvas() {
    const canvas = document.getElementById('g9Canvas');
    canvas.innerHTML = '';
  }

  function renderCanvas() {
    clearCanvas();
    const canvas = document.getElementById('g9Canvas');

    state.elements.forEach((item, idx) => {
      const ring = document.createElement('span');
      ring.className = `fitts-ring ${ringClassForIndex(idx)}`;
      const ringSize = ringRadiusForIndex(idx) * 2;
      ring.style.left = item.x + 'px';
      ring.style.top = item.y + 'px';
      ring.style.width = ringSize + 'px';
      ring.style.height = ringSize + 'px';
      canvas.appendChild(ring);

      const el = document.createElement('div');
      el.className = `fitts-el ${state.selectedId === item.id ? 'selected' : ''}`;
      el.style.left = `${item.x - item.w / 2}px`;
      el.style.top = `${item.y - item.h / 2}px`;
      el.style.width = `${item.w}px`;
      el.style.height = `${item.h}px`;
      el.textContent = item.label;

      const resize = document.createElement('span');
      resize.className = 'fitts-resize-handle';
      el.appendChild(resize);

      el.addEventListener('mousedown', e => startDrag(e, item.id, false));
      resize.addEventListener('mousedown', e => startDrag(e, item.id, true));
      el.addEventListener('click', e => {
        e.stopPropagation();
        state.selectedId = item.id;
        renderCanvas();
      });

      canvas.appendChild(el);
    });
  }

  function startDrag(e, id, resize) {
    e.stopPropagation();
    e.preventDefault();
    const item = state.elements.find(x => x.id === id);
    if (!item) return;

    state.drag = {
      id,
      resize,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
      origW: item.w,
      origH: item.h,
    };

    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', stopDrag);
  }

  function onDragMove(e) {
    if (!state.drag) return;
    const canvas = document.getElementById('g9Canvas');
    const rect = canvas.getBoundingClientRect();
    const item = state.elements.find(x => x.id === state.drag.id);
    if (!item) return;

    const dx = e.clientX - state.drag.startX;
    const dy = e.clientY - state.drag.startY;

    if (state.drag.resize) {
      item.w = clamp(state.drag.origW + dx, 44, 220);
      item.h = clamp(state.drag.origH + dy, 44, 120);
    } else {
      item.x = clamp(state.drag.origX + dx, 22, rect.width - 22);
      item.y = clamp(state.drag.origY + dy, 22, rect.height - 22);
    }

    renderCanvas();
    updateMetrics();
  }

  function stopDrag() {
    if (!state.drag) return;
    state.drag = null;
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', stopDrag);
    state.vera.resetTimer();
  }

  function ringClassForIndex(idx) {
    const t = transitionTimeForIndex(idx);
    if (t < 0.25) return 'fast';
    if (t < 0.35) return 'medium';
    return 'slow';
  }

  function ringRadiusForIndex(idx) {
    const t = transitionTimeForIndex(idx);
    return clamp(Math.round(25 + t * 120), 24, 120);
  }

  function transitionTimeForIndex(idx) {
    if (idx <= 0 || idx >= state.elements.length) return 0.2;
    const prev = state.elements[idx - 1];
    const cur = state.elements[idx];
    const d = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const w = Math.max(1, cur.w);
    return A + B * Math.log2((2 * d) / w + 1);
  }

  function avgTime() {
    if (state.elements.length < 2) return null;
    let sum = 0;
    for (let i = 1; i < state.elements.length; i++) {
      sum += transitionTimeForIndex(i);
    }
    return sum / (state.elements.length - 1);
  }

  function updateMetrics() {
    const t = avgTime();
    const display = t == null ? '--' : `${t.toFixed(2)}s`;
    document.getElementById('g9AvgTime').textContent = display;
    document.getElementById('g9AvgRight').textContent = display;

    if (t != null) {
      state.vera.updateCommentary(`avg acquisition ${t.toFixed(2)}s across ${state.elements.length} targets`);
    }
  }

  function simulateFlow() {
    if (state.elements.length < 2) return;

    const canvas = document.getElementById('g9Canvas');
    let cursor = canvas.querySelector('.fitts-cursor');
    if (!cursor) {
      cursor = document.createElement('span');
      cursor.className = 'fitts-cursor';
      canvas.appendChild(cursor);
    }

    let i = 0;
    cursor.style.left = state.elements[0].x + 'px';
    cursor.style.top = state.elements[0].y + 'px';

    if (state.simulationTimer) clearInterval(state.simulationTimer);
    state.simulationTimer = setInterval(() => {
      i++;
      if (i >= state.elements.length) {
        clearInterval(state.simulationTimer);
        state.simulationTimer = null;
        return;
      }
      const t = transitionTimeForIndex(i);
      cursor.style.transition = `left ${Math.max(180, t * 700)}ms linear, top ${Math.max(180, t * 700)}ms linear`;
      cursor.style.left = state.elements[i].x + 'px';
      cursor.style.top = state.elements[i].y + 'px';
    }, 520);
  }

  function submitLayout() {
    if (state.showingDebrief) return;
    const ch = CHALLENGES[state.idx];

    if (state.elements.length < ch.steps.length) {
      state.vera.wrongAttempt();
      state.vera.updateCommentary(`place at least ${ch.steps.length} targets for this flow`);
      return;
    }

    const t = avgTime();
    if (t == null) return;

    const timeScore = Math.round(clamp((ch.target - t + ch.target) / (2 * ch.target), 0, 1) * 70);

    let constraintBonus = 0;
    if (ch.mobileMin) {
      const valid = state.elements.every(el => el.w >= ch.mobileMin && el.h >= ch.mobileMin);
      constraintBonus += valid ? 15 : 0;
    }
    if (ch.leftHanded) {
      const avgX = state.elements.reduce((s, e) => s + e.x, 0) / state.elements.length;
      constraintBonus += avgX < 280 ? 15 : 0;
    }
    if (ch.accessibility) {
      const avgW = state.elements.reduce((s, e) => s + e.w, 0) / state.elements.length;
      constraintBonus += avgW >= 86 ? 15 : 0;
    }

    let score = timeScore + 30 + constraintBonus;
    const elapsed = (Date.now() - state.startTime) / 1000;
    if (elapsed < 90) score += 10;
    if (!state.vera.wasHintUsed()) score += 15;
    score = clamp(score, 0, 125);

    state.scores.push(score);
    state.showingDebrief = true;

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g9Score').textContent = total;
    document.getElementById('g9ScoreRight').textContent = total;

    document.getElementById('g9DebriefGood').textContent =
      `Average acquisition time ${t.toFixed(2)}s (target ${ch.target.toFixed(2)}s).`;
    document.getElementById('g9DebriefMiss').textContent =
      t > ch.target ? 'Reduce distances and enlarge the next-step targets to improve flow speed.' :
      'Strong layout efficiency. Continue tightening the highest-cost transitions.';

    const overlay = document.getElementById('g9Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('fitts flow optimized');
  }

  function nextChallenge() {
    const overlay = document.getElementById('g9Debrief');
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.style.display = 'none'; }, 400);
    state.showingDebrief = false;
    state.vera.resetTimer();

    const next = state.idx + 1;
    if (next >= CHALLENGES.length) showComplete();
    else loadChallenge(next);
  }

  function showComplete() {
    const total = state.scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / state.scores.length);
    const xp = avg * 10;

    const saved = JSON.parse(localStorage.getItem('cognitive_game_scores') || '{}');
    saved.G09 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('cognitive_game_scores', JSON.stringify(saved));

    const prog = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!prog.completedGames) prog.completedGames = [];
    if (!prog.completedGames.includes('G09')) prog.completedGames.push('G09');
    prog.totalXP = (prog.totalXP || 0) + xp;
    if (!prog.skillLevels) prog.skillLevels = {};
    prog.skillLevels.cognitive = Math.min(100, (prog.skillLevels.cognitive || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(prog));

    document.getElementById('g9XP').textContent = `+${xp} XP`;
    document.getElementById('g9PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g9Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));

    const el = document.getElementById('g9FinalScore');
    let cur = 0;
    const step = Math.ceil(avg / 60);
    const timer = setInterval(() => {
      cur = Math.min(cur + step, avg);
      el.textContent = cur;
      if (cur >= avg) clearInterval(timer);
    }, 16);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
