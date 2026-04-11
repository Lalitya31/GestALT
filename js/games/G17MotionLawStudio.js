(() => {
  'use strict';

  const CHALLENGES = [
    { id: 1, name: 'Button hover I', min: 120, max: 260 },
    { id: 2, name: 'Button hover II', min: 120, max: 260 },
    { id: 3, name: 'Modal enter', min: 220, max: 420 },
    { id: 4, name: 'Modal exit', min: 180, max: 360 },
    { id: 5, name: 'Navigation transition I', min: 220, max: 420 },
    { id: 6, name: 'Navigation transition II', min: 220, max: 420 },
    { id: 7, name: 'Loading to content I', min: 180, max: 350 },
    { id: 8, name: 'Loading to content II', min: 180, max: 350 },
    { id: 9, name: 'Mobile sheet spring', min: 260, max: 500 },
    { id: 10, name: 'Notification stack', min: 160, max: 320 },
  ];

  const PRESETS = {
    linear: [0.0, 0.0, 1.0, 1.0],
    'ease-in': [0.42, 0.0, 1.0, 1.0],
    'ease-out': [0.0, 0.0, 0.58, 1.0],
    'ease-in-out': [0.42, 0.0, 0.58, 1.0],
    spring: [0.2, 1.1, 0.2, 1.0],
  };

  const state = {
    idx: 0,
    scores: [],
    layers: [],
    selectedLayer: null,
    curve: [0.42, 0.0, 0.58, 1.0],
    playing: false,
    vera: null,
    showingDebrief: false,
  };

  function init() {
    const brief = document.getElementById('g17Brief');
    if (!brief) return;

    brief.addEventListener('click', start);
    document.getElementById('g17TheoryToggle').addEventListener('click', () => {
      document.getElementById('g17Theory').classList.toggle('collapsed');
    });

    document.getElementById('g17Preset').addEventListener('change', applyPreset);
    ['g17Cx1', 'g17Cy1', 'g17Cx2', 'g17Cy2'].forEach(id => {
      document.getElementById(id).addEventListener('input', onCurveChange);
    });

    document.getElementById('g17Play').addEventListener('click', play);
    document.getElementById('g17Submit').addEventListener('click', submit);
    document.getElementById('g17Next').addEventListener('click', next);
    document.getElementById('g17Return').addEventListener('click', () => window.returnToDashboard());

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g17VeraOrb',
      commentId: 'g17VeraComment',
      hintQuestion: 'Heavy objects accelerate slowly and decelerate quickly. What does your UI weigh?',
      interventionText: 'Use duration for intent, and easing for physical believability.',
    });
  }

  function start() {
    const brief = document.getElementById('g17Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 320);
    document.getElementById('g17Header').style.display = 'flex';
    document.getElementById('g17Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.idx = idx;
    state.layers = [
      { id: 'l1', name: 'Primary', keys: [0, 220], easing: 'ease-out' },
      { id: 'l2', name: 'Secondary', keys: [60, 300], easing: 'ease-in-out' },
      { id: 'l3', name: 'Support', keys: [120, 340], easing: 'linear' },
    ];
    state.selectedLayer = 'l1';
    state.curve = [...PRESETS['ease-in-out']];
    state.playing = false;
    state.showingDebrief = false;

    const ch = CHALLENGES[idx];
    document.getElementById('g17Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
    document.getElementById('g17Scenario').textContent = ch.name;
    document.getElementById('g17DurationHint').textContent = `${ch.min}-${ch.max}ms`;

    syncCurveUI();
    renderTimeline();
    renderPreview();
    updateMetrics();
    state.vera.resetTimer();
  }

  function renderTimeline() {
    const rows = document.getElementById('g17TimelineRows');
    rows.innerHTML = '';

    state.layers.forEach(layer => {
      const row = document.createElement('div');
      row.className = 'motion-row';
      row.dataset.id = layer.id;
      row.innerHTML = `<span class="motion-row-label">${layer.name}</span><div class="motion-track" data-id="${layer.id}"></div>`;
      if (state.selectedLayer === layer.id) row.classList.add('selected');

      row.querySelector('.motion-row-label').addEventListener('click', () => {
        state.selectedLayer = layer.id;
        renderTimeline();
      });

      const track = row.querySelector('.motion-track');
      track.addEventListener('click', e => onTrackClick(e, layer.id));

      layer.keys.forEach((t, idx) => {
        const key = document.createElement('button');
        key.className = 'motion-keyframe';
        key.style.left = `${(t / 1000) * 100}%`;
        key.title = `${t}ms`;
        key.addEventListener('click', ev => {
          ev.stopPropagation();
          removeKey(layer.id, idx);
        });
        track.appendChild(key);
      });

      rows.appendChild(row);
    });
  }

  function onTrackClick(e, id) {
    const layer = state.layers.find(x => x.id === id);
    if (!layer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const ms = Math.round(ratio * 1000);
    layer.keys.push(ms);
    layer.keys.sort((a, b) => a - b);
    if (layer.keys.length > 4) layer.keys = layer.keys.slice(0, 4);
    state.selectedLayer = id;
    renderTimeline();
    updateMetrics();
    state.vera.resetTimer();
  }

  function removeKey(id, idx) {
    const layer = state.layers.find(x => x.id === id);
    if (!layer || layer.keys.length <= 2) return;
    layer.keys.splice(idx, 1);
    renderTimeline();
    updateMetrics();
  }

  function applyPreset() {
    const p = document.getElementById('g17Preset').value;
    state.curve = [...(PRESETS[p] || PRESETS.linear)];
    syncCurveUI();
    renderCurveBall();
    updateMetrics();
  }

  function onCurveChange() {
    state.curve = [
      Number(document.getElementById('g17Cx1').value),
      Number(document.getElementById('g17Cy1').value),
      Number(document.getElementById('g17Cx2').value),
      Number(document.getElementById('g17Cy2').value),
    ];
    renderCurveBall();
    updateMetrics();
  }

  function syncCurveUI() {
    document.getElementById('g17Cx1').value = String(state.curve[0]);
    document.getElementById('g17Cy1').value = String(state.curve[1]);
    document.getElementById('g17Cx2').value = String(state.curve[2]);
    document.getElementById('g17Cy2').value = String(state.curve[3]);
    renderCurveBall();
  }

  function renderCurveBall() {
    const ball = document.getElementById('g17CurveBall');
    const linearity = Math.abs(state.curve[0] - 0.5) + Math.abs(state.curve[1] - 0.5) + Math.abs(state.curve[2] - 0.5) + Math.abs(state.curve[3] - 0.5);
    const px = clamp(Math.round((linearity / 2) * 120), 10, 120);
    ball.style.transform = `translateX(${px}px)`;
  }

  function renderPreview() {
    const preview = document.getElementById('g17Preview');
    preview.innerHTML = '';
    state.layers.forEach((l, i) => {
      const box = document.createElement('div');
      box.className = 'motion-box';
      box.style.top = `${40 + i * 60}px`;
      box.textContent = l.name;
      box.dataset.id = l.id;
      preview.appendChild(box);
    });
  }

  function durationForLayer(layer) {
    if (layer.keys.length < 2) return 0;
    return layer.keys[layer.keys.length - 1] - layer.keys[0];
  }

  function avgDuration() {
    const d = state.layers.map(durationForLayer);
    return d.length ? d.reduce((a, b) => a + b, 0) / d.length : 0;
  }

  function easingNaturalness() {
    const linearDist = Math.abs(state.curve[0] - 0) + Math.abs(state.curve[1] - 0) + Math.abs(state.curve[2] - 1) + Math.abs(state.curve[3] - 1);
    const easeOutDist = Math.abs(state.curve[0] - 0.0) + Math.abs(state.curve[1] - 0.0) + Math.abs(state.curve[2] - 0.58) + Math.abs(state.curve[3] - 1.0);
    const best = Math.min(linearDist, easeOutDist);
    return clamp(1 - best / 2.4, 0, 1);
  }

  function updateMetrics() {
    const ch = CHALLENGES[state.idx];
    const avg = avgDuration();

    const inform = clamp(1 - Math.abs(avg - (ch.min + ch.max) / 2) / 400, 0, 1);
    const orient = clamp(state.layers.filter(l => l.keys.length >= 2).length / state.layers.length, 0, 1);
    const engage = clamp(1 - Math.abs(state.curve[1] - 0.2) - Math.abs(state.curve[3] - 1.0), 0, 1);
    const natural = easingNaturalness();

    document.getElementById('g17Inform').textContent = `${Math.round(inform * 100)}%`;
    document.getElementById('g17Orient').textContent = `${Math.round(orient * 100)}%`;
    document.getElementById('g17Engage').textContent = `${Math.round(engage * 100)}%`;
    document.getElementById('g17DurationVal').textContent = `${Math.round(avg)}ms`;
    document.getElementById('g17EasingVal').textContent = `${Math.round(natural * 100)}%`;

    if (avg > 500) state.vera.updateCommentary('800ms for micro-interaction feels slow and heavy.');
    else if (avg < 100) state.vera.updateCommentary('Under 100ms can feel abrupt and unclear.');
    else state.vera.updateCommentary('Motion timing is within a usable interaction band.');
  }

  function play() {
    if (state.playing) return;
    state.playing = true;

    const preview = document.getElementById('g17Preview');
    preview.querySelectorAll('.motion-box').forEach(el => {
      const layer = state.layers.find(x => x.id === el.dataset.id);
      const duration = Math.max(120, durationForLayer(layer));
      el.style.transition = `transform ${duration}ms cubic-bezier(${state.curve.join(',')})`;
      el.style.transform = 'translateX(0px)';
      requestAnimationFrame(() => {
        el.style.transform = 'translateX(280px)';
      });
    });

    setTimeout(() => {
      preview.querySelectorAll('.motion-box').forEach(el => {
        el.style.transform = 'translateX(0px)';
      });
      state.playing = false;
    }, 1200);
  }

  function submit() {
    if (state.showingDebrief) return;

    const ch = CHALLENGES[state.idx];
    const avg = avgDuration();
    const dScore = clamp(1 - Math.abs(avg - (ch.min + ch.max) / 2) / 450, 0, 1);
    const nScore = easingNaturalness();
    const rowCoverage = clamp(state.layers.filter(l => l.keys.length >= 2).length / state.layers.length, 0, 1);

    let score = Math.round((dScore * 0.4 + nScore * 0.35 + rowCoverage * 0.25) * 100);
    if (!state.vera.wasHintUsed()) score += 10;
    score = clamp(score, 0, 125);

    state.scores.push(score);
    state.showingDebrief = true;

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g17Score').textContent = String(total);

    document.getElementById('g17DebriefGood').textContent = `Average duration ${Math.round(avg)}ms. Easing naturalness ${Math.round(nScore * 100)}%.`;
    document.getElementById('g17DebriefMiss').textContent =
      avg > 500
        ? 'Duration is too long for UI transitions. Reduce friction and tighten response.'
        : (nScore < 0.45 ? 'Curve feels mechanical. Try ease-out or spring-like acceleration.' : 'Purposeful motion improves orientation and clarity.');

    const overlay = document.getElementById('g17Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('motion studio pass');
  }

  function next() {
    const overlay = document.getElementById('g17Debrief');
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

    const saved = JSON.parse(localStorage.getItem('interaction_game_scores') || '{}');
    saved.G17 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('interaction_game_scores', JSON.stringify(saved));

    const progress = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!progress.completedGames) progress.completedGames = [];
    if (!progress.completedGames.includes('G17')) progress.completedGames.push('G17');
    progress.totalXP = (progress.totalXP || 0) + xp;
    if (!progress.skillLevels) progress.skillLevels = {};
    progress.skillLevels.interaction = Math.min(100, (progress.skillLevels.interaction || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(progress));

    document.getElementById('g17FinalScore').textContent = String(avg);
    document.getElementById('g17XP').textContent = `+${xp} XP`;
    document.getElementById('g17PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g17Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
