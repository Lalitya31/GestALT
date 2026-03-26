(function () {
  'use strict';

  const B = 0.166;

  const CHALLENGES = [
    { id: 1, scenario: 'Restaurant menu', target: 0.95, required: ['Starters', 'Mains', 'Desserts', 'Drinks'], optimal: ['Menu', 'Search', 'Offers', 'Cart'] },
    { id: 2, scenario: 'Restaurant menu II', target: 0.9, required: ['Starters', 'Mains', 'Desserts', 'Drinks'], optimal: ['Menu', 'Search', 'Combo', 'Cart'] },
    { id: 3, scenario: 'App navigation', target: 0.7, required: ['Home', 'Projects', 'Messages', 'Profile', 'Settings', 'Help'], optimal: ['Home', 'Work', 'Messages', 'Me'] },
    { id: 4, scenario: 'App navigation II', target: 0.68, required: ['Home', 'Tasks', 'Search', 'Notifications', 'Profile', 'Settings'], optimal: ['Home', 'Work', 'Search', 'Me'] },
    { id: 5, scenario: 'E-commerce filters', target: 0.6, required: ['Price', 'Brand', 'Size', 'Color'], optimal: ['Filters', 'Sort', 'Search', 'Results'] },
    { id: 6, scenario: 'E-commerce filters II', target: 0.58, required: ['Price', 'Brand', 'Rating', 'Availability'], optimal: ['Filters', 'Sort', 'Search', 'Apply'] },
    { id: 7, scenario: 'Settings screen', target: 0.7, required: ['Account', 'Privacy', 'Notifications', 'Billing'], optimal: ['General', 'Privacy', 'Notifications', 'Account', 'Support'] },
    { id: 8, scenario: 'Settings screen II', target: 0.68, required: ['Account', 'Security', 'Billing', 'Integrations'], optimal: ['General', 'Security', 'Billing', 'Advanced', 'Help'] },
    { id: 9, scenario: 'Emergency medical UI', target: 0.45, required: ['Alert', 'Patient', 'Vitals', 'Medication'], optimal: ['Alert', 'Patient', 'Vitals'] },
    { id: 10, scenario: 'Emergency triage UI', target: 0.42, required: ['Alert', 'Vitals', 'Action', 'Confirm'], optimal: ['Alert', 'Vitals', 'Action'] },
  ];

  let state = {
    idx: 0,
    scores: [],
    items: ['Home'],
    startTime: 0,
    vera: null,
    showingDebrief: false,
  };

  function init() {
    document.getElementById('g8Brief').addEventListener('click', startGame);
    document.getElementById('g8TheoryToggle').addEventListener('click', () => {
      document.getElementById('g8Theory').classList.toggle('collapsed');
    });

    document.getElementById('g8AddItem').addEventListener('click', addItem);
    document.getElementById('g8ClearItems').addEventListener('click', clearItems);
    document.getElementById('g8Submit').addEventListener('click', submitDesign);
    document.getElementById('g8Next').addEventListener('click', nextChallenge);
    document.getElementById('g8Return').addEventListener('click', () => window.returnToDashboard());

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g8VeraOrb',
      commentId: 'g8VeraComment',
      hintQuestion: 'Which options are truly needed in the first decision?',
      interventionText: 'Group secondary options under one top-level label to reduce choice count.',
    });
  }

  function startGame() {
    const brief = document.getElementById('g8Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 400);
    document.getElementById('g8Header').style.display = 'flex';
    document.getElementById('g8Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.idx = idx;
    state.items = ['Home'];
    state.showingDebrief = false;
    state.startTime = Date.now();

    const ch = CHALLENGES[idx];
    document.getElementById('g8Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
    document.getElementById('g8Scenario').textContent = `Design: ${ch.scenario}`;
    document.getElementById('g8Target').textContent = `${ch.target.toFixed(2)}s`;
    document.getElementById('g8Duel').style.display = 'none';
    document.getElementById('g8ItemInput').value = '';
    renderItems();
    updateFormula();
    state.vera.updateCommentary('start with critical actions only');
  }

  function addItem() {
    const input = document.getElementById('g8ItemInput');
    const value = input.value.trim();
    if (!value) return;
    if (state.items.length >= 20) return;
    state.items.push(value);
    input.value = '';
    renderItems();
    updateFormula();
    state.vera.resetTimer();
  }

  function clearItems() {
    state.items = ['Home'];
    renderItems();
    updateFormula();
  }

  function removeItem(idx) {
    if (idx <= 0) return;
    state.items.splice(idx, 1);
    renderItems();
    updateFormula();
  }

  function renderItems() {
    const wrap = document.getElementById('g8NavPreview');
    wrap.innerHTML = '';

    state.items.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'hicks-nav-item';
      el.innerHTML = `<span>${item}</span>${idx > 0 ? '<span class="item-remove">×</span>' : ''}`;
      if (idx > 0) {
        el.querySelector('.item-remove').addEventListener('click', e => {
          e.stopPropagation();
          removeItem(idx);
        });
      }
      wrap.appendChild(el);
    });

    document.getElementById('g8ItemCount').textContent = String(state.items.length);
  }

  function decisionTime(n) {
    return B * Math.log2(n + 1);
  }

  function updateFormula() {
    const n = state.items.length;
    const t = decisionTime(n);
    document.getElementById('g8Formula').textContent = `T = 0.166 × log2(${n} + 1) = ${t.toFixed(2)}s`;
    document.getElementById('g8Time').textContent = `${t.toFixed(2)}s`;

    const timeEl = document.getElementById('g8Time');
    timeEl.style.color = t < 0.5 ? '#4ADE80' : (t <= 1.0 ? '#F59E0B' : '#EF4444');

    state.vera.updateCommentary(`${n} items at this level - Hick predicts ${t.toFixed(2)}s`);
  }

  function containsRequired(items, required) {
    const blob = items.join(' ').toLowerCase();
    const found = required.filter(r => blob.includes(r.toLowerCase())).length;
    return { found, total: required.length, ratio: required.length ? found / required.length : 1 };
  }

  function submitDesign() {
    if (state.showingDebrief) return;
    const ch = CHALLENGES[state.idx];
    const t = decisionTime(state.items.length);
    const discover = containsRequired(state.items, ch.required);

    const timeRatio = clamp((ch.target - t + ch.target) / (2 * ch.target), 0, 1);
    const timeScore = Math.round(timeRatio * 60);
    const discoverScore = Math.round(discover.ratio * 40);

    let score = timeScore + discoverScore;
    const elapsed = (Date.now() - state.startTime) / 1000;
    if (elapsed < 70) score += 10;
    if (!state.vera.wasHintUsed()) score += 15;
    score = clamp(score, 0, 125);

    state.scores.push(score);
    state.showingDebrief = true;

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g8Score').textContent = total;
    document.getElementById('g8ScoreRight').textContent = total;

    document.getElementById('g8DebriefGood').textContent =
      `Decision time: ${t.toFixed(2)}s (target ${ch.target.toFixed(2)}s). Discoverability: ${discover.found}/${discover.total}.`;
    document.getElementById('g8DebriefMiss').textContent =
      t > ch.target ? 'Too many top-level choices. Group or move secondary options behind one label.' :
      (discover.ratio < 1 ? 'Some required functions are not discoverable from your labels.' : 'Strong balance between speed and discoverability.');

    renderDuel(ch, t);
    const overlay = document.getElementById('g8Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('hick duel complete');
  }

  function renderDuel(ch, userTime) {
    const duel = document.getElementById('g8Duel');
    const userNav = document.getElementById('g8UserNav');
    const optimalNav = document.getElementById('g8OptimalNav');
    userNav.innerHTML = state.items.map(x => `<span class="hicks-nav-item">${x}</span>`).join('');
    optimalNav.innerHTML = ch.optimal.map(x => `<span class="hicks-nav-item">${x}</span>`).join('');

    const optimalTime = decisionTime(ch.optimal.length);
    document.getElementById('g8UserTime').textContent = `${userTime.toFixed(2)}s`;
    document.getElementById('g8OptimalTime').textContent = `${optimalTime.toFixed(2)}s`;
    duel.style.display = 'flex';
  }

  function nextChallenge() {
    const overlay = document.getElementById('g8Debrief');
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
    saved.G08 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('cognitive_game_scores', JSON.stringify(saved));

    const prog = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!prog.completedGames) prog.completedGames = [];
    if (!prog.completedGames.includes('G08')) prog.completedGames.push('G08');
    prog.totalXP = (prog.totalXP || 0) + xp;
    if (!prog.skillLevels) prog.skillLevels = {};
    prog.skillLevels.cognitive = Math.min(100, (prog.skillLevels.cognitive || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(prog));

    document.getElementById('g8XP').textContent = `+${xp} XP`;
    document.getElementById('g8PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g8Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));

    const el = document.getElementById('g8FinalScore');
    let cur = 0;
    const step = Math.ceil(avg / 60);
    const tick = setInterval(() => {
      cur = Math.min(cur + step, avg);
      el.textContent = cur;
      if (cur >= avg) clearInterval(tick);
    }, 16);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
