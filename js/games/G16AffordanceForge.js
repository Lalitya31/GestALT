(() => {
  'use strict';

  const BASE_LIBRARY = [
    { type: 'button', text: 'Continue' },
    { type: 'link', text: 'Forgot password' },
    { type: 'input', text: 'Search products' },
    { type: 'toggle', text: 'Enable notifications' },
    { type: 'dropdown', text: 'Sort by relevance' },
    { type: 'button', text: 'Submit form' },
    { type: 'link', text: 'View details' },
    { type: 'input', text: 'Email address' },
    { type: 'toggle', text: 'Auto renew' },
    { type: 'dropdown', text: 'Filter status' },
    { type: 'tableHeader', text: 'Order Date' },
    { type: 'row', text: 'Order #1038' },
    { type: 'cellExpand', text: 'Expand notes' },
    { type: 'cardAction', text: 'Open analytics' },
    { type: 'gestureZone', text: 'Swipe area' },
  ];

  const CHALLENGES = [
    { id: 1, name: 'Basic affordances I', count: 5 },
    { id: 2, name: 'Basic affordances II', count: 5 },
    { id: 3, name: 'Basic affordances III', count: 5 },
    { id: 4, name: 'Form accessibility I', count: 10 },
    { id: 5, name: 'Form accessibility II', count: 10 },
    { id: 6, name: 'Card interaction zones I', count: 8 },
    { id: 7, name: 'Card interaction zones II', count: 8 },
    { id: 8, name: 'Data table affordance I', count: 9 },
    { id: 9, name: 'Data table affordance II', count: 9 },
    { id: 10, name: 'Novel gesture interface', count: 7 },
  ];

  const state = {
    idx: 0,
    scores: [],
    items: [],
    selectedId: null,
    dragDivider: false,
    vera: null,
    showingDebrief: false,
  };

  function init() {
    const brief = document.getElementById('g16Brief');
    if (!brief) return;

    brief.addEventListener('click', start);
    document.getElementById('g16TheoryToggle').addEventListener('click', () => {
      document.getElementById('g16Theory').classList.toggle('collapsed');
    });

    document.getElementById('g16Depth').addEventListener('change', applyPanel);
    document.getElementById('g16Cursor').addEventListener('change', applyPanel);
    document.getElementById('g16Color').addEventListener('change', applyPanel);
    document.getElementById('g16Motion').addEventListener('change', applyPanel);
    document.getElementById('g16Label').addEventListener('input', applyPanel);
    document.getElementById('g16State').addEventListener('change', applyPanel);

    document.getElementById('g16Submit').addEventListener('click', submit);
    document.getElementById('g16Next').addEventListener('click', next);
    document.getElementById('g16Return').addEventListener('click', () => window.returnToDashboard());

    const divider = document.getElementById('g16Divider');
    divider.addEventListener('pointerdown', onDividerDown);
    window.addEventListener('pointermove', onDividerMove);
    window.addEventListener('pointerup', () => { state.dragDivider = false; });

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g16VeraOrb',
      commentId: 'g16VeraComment',
      hintQuestion: 'If a user had never seen a button before, what signal tells them this does something?',
      interventionText: 'Interactive elements need at least two signals: shape/depth plus behavior feedback.',
    });
  }

  function start() {
    const brief = document.getElementById('g16Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 320);
    document.getElementById('g16Header').style.display = 'flex';
    document.getElementById('g16Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.idx = idx;
    state.selectedId = null;
    state.showingDebrief = false;

    const ch = CHALLENGES[idx];
    document.getElementById('g16Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
    document.getElementById('g16Scenario').textContent = ch.name;

    state.items = BASE_LIBRARY.slice(0, ch.count).map((it, i) => ({
      id: `e${i + 1}`,
      type: it.type,
      baseText: it.text,
      signals: {
        depth: 'none',
        cursor: 'default',
        color: 'neutral',
        motion: 'none',
        label: '',
        active: 'none',
      },
    }));

    renderBefore();
    renderAfter();
    updateMetrics();
    state.vera.resetTimer();
    state.vera.updateCommentary('This looks static. Add cues that signal action and intent.');
  }

  function renderBefore() {
    const wrap = document.getElementById('g16BeforeList');
    wrap.innerHTML = '';
    state.items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'af-item af-before';
      row.textContent = it.baseText;
      wrap.appendChild(row);
    });
  }

  function renderAfter() {
    const wrap = document.getElementById('g16AfterList');
    wrap.innerHTML = '';
    state.items.forEach(it => {
      const row = document.createElement('button');
      row.className = 'af-item af-after';
      row.dataset.id = it.id;
      row.textContent = it.signals.label || it.baseText;
      row.addEventListener('click', () => selectItem(it.id));
      applyVisualSignals(row, it.signals);
      if (state.selectedId === it.id) row.classList.add('selected');
      wrap.appendChild(row);
    });
  }

  function applyVisualSignals(row, s) {
    row.style.boxShadow = s.depth === 'shadow' ? '0 6px 14px rgba(99,102,241,0.28)' : 'none';
    row.style.borderWidth = s.depth === 'elevated' ? '2px' : '1px';
    row.style.cursor = s.cursor;
    row.style.background = s.color === 'accent' ? 'rgba(99,102,241,0.20)' : '#1a1a1f';
    row.style.color = s.color === 'accent' ? '#ffffff' : '#d8d8f0';
    row.style.transform = s.motion === 'scale' ? 'scale(1.01)' : 'none';
    row.style.textDecoration = s.motion === 'underline' ? 'underline' : 'none';
    if (s.active === 'filled') row.style.outline = '2px solid #6366F1';
    else if (s.active === 'inset') row.style.outline = '2px solid rgba(74,222,128,.6)';
    else row.style.outline = 'none';
  }

  function selectItem(id) {
    state.selectedId = id;
    const item = state.items.find(x => x.id === id);
    if (!item) return;

    document.getElementById('g16Depth').value = item.signals.depth;
    document.getElementById('g16Cursor').value = item.signals.cursor;
    document.getElementById('g16Color').value = item.signals.color;
    document.getElementById('g16Motion').value = item.signals.motion;
    document.getElementById('g16Label').value = item.signals.label;
    document.getElementById('g16State').value = item.signals.active;

    renderAfter();
    updateMetrics();
  }

  function applyPanel() {
    if (!state.selectedId) return;
    const item = state.items.find(x => x.id === state.selectedId);
    if (!item) return;

    item.signals.depth = document.getElementById('g16Depth').value;
    item.signals.cursor = document.getElementById('g16Cursor').value;
    item.signals.color = document.getElementById('g16Color').value;
    item.signals.motion = document.getElementById('g16Motion').value;
    item.signals.label = document.getElementById('g16Label').value.trim();
    item.signals.active = document.getElementById('g16State').value;

    renderAfter();
    updateMetrics();
    state.vera.resetTimer();
  }

  function scoreItem(it) {
    const s = it.signals;

    let clarity = 0;
    if (s.depth !== 'none') clarity += 10;
    if (s.color === 'accent') clarity += 10;
    if (s.motion !== 'none') clarity += 8;
    if (s.cursor !== 'default') clarity += 6;
    if (s.label) clarity += 6;

    let appropriate = 0;
    if (it.type === 'input' && s.cursor === 'text') appropriate += 10;
    if (it.type === 'toggle' && (s.cursor === 'pointer' || s.cursor === 'grab')) appropriate += 10;
    if (it.type.includes('button') && s.cursor === 'pointer') appropriate += 10;
    if (it.type === 'link' && (s.motion === 'underline' || s.label.toLowerCase().includes('view'))) appropriate += 10;

    let consistency = 0;
    const same = state.items.filter(x => x.type === it.type);
    if (same.length <= 1) {
      consistency = 30;
    } else {
      const matchCount = same.filter(x =>
        x.signals.cursor === s.cursor &&
        x.signals.color === s.color &&
        x.signals.depth === s.depth
      ).length;
      consistency = Math.round((matchCount / same.length) * 30);
    }

    return {
      clarity: clamp(clarity, 0, 40),
      appropriate: clamp(appropriate, 0, 30),
      consistency: clamp(consistency, 0, 30),
    };
  }

  function updateMetrics() {
    if (!state.items.length) return;
    const scored = state.items.map(scoreItem);

    const totals = scored.reduce((a, s) => {
      a.clarity += s.clarity;
      a.appropriate += s.appropriate;
      a.consistency += s.consistency;
      return a;
    }, { clarity: 0, appropriate: 0, consistency: 0 });

    const avg = Math.round((totals.clarity + totals.appropriate + totals.consistency) / state.items.length);

    document.getElementById('g16Clarity').textContent = `${Math.round(totals.clarity / state.items.length)}`;
    document.getElementById('g16Appropriate').textContent = `${Math.round(totals.appropriate / state.items.length)}`;
    document.getElementById('g16Consistency').textContent = `${Math.round(totals.consistency / state.items.length)}`;
    document.getElementById('g16AffordanceScore').textContent = `${avg}`;

    if (avg < 45) state.vera.updateCommentary('This still looks like static copy, not controls.');
    else if (avg < 72) state.vera.updateCommentary('Getting clearer. Align similar controls for consistency.');
    else state.vera.updateCommentary('Strong affordance language and interaction clarity.');
  }

  function onDividerDown() {
    state.dragDivider = true;
  }

  function onDividerMove(e) {
    if (!state.dragDivider) return;
    const split = document.getElementById('g16Split');
    const rect = split.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0.2, 0.8);
    split.style.setProperty('--divider', `${(ratio * 100).toFixed(1)}%`);
  }

  function submit() {
    if (state.showingDebrief) return;
    const scored = state.items.map(scoreItem);
    let score = Math.round(scored.reduce((a, s) => a + s.clarity + s.appropriate + s.consistency, 0) / state.items.length);
    if (!state.vera.wasHintUsed()) score += 10;
    score = clamp(score, 0, 125);

    state.scores.push(score);
    state.showingDebrief = true;

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g16Score').textContent = String(total);

    document.getElementById('g16DebriefGood').textContent = `Affordance score ${score}. Signals now communicate interaction intent more clearly.`;
    document.getElementById('g16DebriefMiss').textContent =
      score < 70
        ? 'Some controls still look passive. Add clearer cursor, action labels, and active states.'
        : 'Good consistency. Interactive zones now read as actionable.';

    const overlay = document.getElementById('g16Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('affordance forge complete');
  }

  function next() {
    const overlay = document.getElementById('g16Debrief');
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
    saved.G16 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('interaction_game_scores', JSON.stringify(saved));

    const progress = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!progress.completedGames) progress.completedGames = [];
    if (!progress.completedGames.includes('G16')) progress.completedGames.push('G16');
    progress.totalXP = (progress.totalXP || 0) + xp;
    if (!progress.skillLevels) progress.skillLevels = {};
    progress.skillLevels.interaction = Math.min(100, (progress.skillLevels.interaction || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(progress));

    document.getElementById('g16FinalScore').textContent = String(avg);
    document.getElementById('g16XP').textContent = `+${xp} XP`;
    document.getElementById('g16PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g16Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
