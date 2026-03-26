(function () {
  'use strict';

  const CHALLENGES = [
    { id: 1, label: 'Simple list A', count: 14, recalls: false },
    { id: 2, label: 'Simple list B', count: 15, recalls: false },
    { id: 3, label: 'Simple list C', count: 15, recalls: false, snapshot: true },
    { id: 4, label: 'Navigation set A', count: 20, recalls: false },
    { id: 5, label: 'Recall challenge 3', count: 20, recalls: true, recallFrom: 3 },
    { id: 6, label: 'Settings panel A', count: 30, recalls: false },
    { id: 7, label: 'Settings panel B', count: 30, recalls: false, snapshot: true },
    { id: 8, label: 'Data cluster A', count: 26, recalls: false },
    { id: 9, label: 'Recall challenge 7', count: 26, recalls: true, recallFrom: 7 },
    { id: 10, label: 'IA mega chunking', count: 52, recalls: false },
  ];

  const LABEL_POOL = [
    'Home', 'Profile', 'Billing', 'Permissions', 'Audit', 'Security', 'Language', 'Theme', 'Export', 'Import',
    'Alerts', 'Email', 'SMS', 'Webhook', 'Integrations', 'Reports', 'Analytics', 'Team', 'Roles', 'Tokens',
    'Search', 'Filters', 'Sort', 'Columns', 'Charts', 'Tables', 'Overview', 'Orders', 'Customers', 'Products',
    'Checkout', 'Shipping', 'Returns', 'Coupons', 'Support', 'FAQ', 'Docs', 'API', 'Console', 'Logs',
    'Backups', 'Restore', 'Cron', 'Scheduler', 'Sandbox', 'Staging', 'Production', 'AI', 'Insights', 'Experiments',
    'Roadmap', 'Feedback', 'Announcements', 'Status', 'Sync', 'Offline', 'Cache', 'Devices', 'Sessions', 'Preferences'
  ];

  let state = {
    idx: 0,
    scores: [],
    phase: 1,
    items: [],
    flagged: new Set(),
    violationSet: new Set(),
    groups: [],
    currentSelection: [],
    lassoEl: null,
    lassoStart: null,
    recallInputs: {},
    memory: {},
    startTime: 0,
    vera: null,
    showingDebrief: false,
  };

  function init() {
    document.getElementById('g10Brief').addEventListener('click', startGame);
    document.getElementById('g10TheoryToggle').addEventListener('click', () => {
      document.getElementById('g10Theory').classList.toggle('collapsed');
    });

    document.getElementById('g10SubmitDiagnose').addEventListener('click', submitDiagnose);
    document.getElementById('g10SubmitChunk').addEventListener('click', submitChunk);
    document.getElementById('g10SubmitRecall').addEventListener('click', submitRecall);
    document.getElementById('g10Next').addEventListener('click', nextChallenge);
    document.getElementById('g10Return').addEventListener('click', () => window.returnToDashboard());

    bindLasso();

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g10VeraOrb',
      commentId: 'g10VeraComment',
      hintQuestion: 'If someone had to remember this in 30 seconds, what grouping would help?',
      interventionText: 'Create smaller semantic chunks and label them with clear nouns.',
    });
  }

  function startGame() {
    const brief = document.getElementById('g10Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 400);
    document.getElementById('g10Header').style.display = 'flex';
    document.getElementById('g10Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    const ch = CHALLENGES[idx];
    state.idx = idx;
    state.phase = 1;
    state.items = makeItems(ch.count, ch.id);
    state.flagged = new Set();
    state.violationSet = buildViolationSet(state.items);
    state.groups = [];
    state.currentSelection = [];
    state.recallInputs = {};
    state.showingDebrief = false;
    state.startTime = Date.now();

    document.getElementById('g10Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
    document.getElementById('g10Instruction').textContent = `Identify violations for: ${ch.label}`;
    document.getElementById('g10PhaseLabel').textContent = 'PHASE 1 - DIAGNOSE';
    document.getElementById('g10PhaseDesc').textContent = "Click items that violate Miller's 7±2 rule.";

    showOnly('g10Phase1');
    renderDiagnose();
    renderGroupCount();
    document.getElementById('g10Violations').textContent = '0';
    state.vera.updateCommentary(`${state.violationSet.size} items likely exceed memory limits`);
  }

  function makeItems(count, seed) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const label = LABEL_POOL[(i + seed * 3) % LABEL_POOL.length];
      out.push({ id: `m_${seed}_${i}`, label: `${label}` });
    }
    return out;
  }

  function buildViolationSet(items) {
    const set = new Set();
    // Mark everything above 9 as likely overload in a flat list.
    for (let i = 9; i < items.length; i++) set.add(items[i].id);
    return set;
  }

  function renderDiagnose() {
    const wrap = document.getElementById('g10Items');
    wrap.innerHTML = '';

    state.items.forEach(item => {
      const el = document.createElement('div');
      el.className = `miller-item ${state.flagged.has(item.id) ? 'flagged' : ''}`;
      el.textContent = item.label;
      el.addEventListener('click', () => {
        if (state.flagged.has(item.id)) state.flagged.delete(item.id);
        else state.flagged.add(item.id);
        renderDiagnose();
        document.getElementById('g10Violations').textContent = String(state.flagged.size);
        state.vera.resetTimer();
      });
      wrap.appendChild(el);
    });
  }

  function submitDiagnose() {
    const truePos = [...state.flagged].filter(id => state.violationSet.has(id)).length;
    const falsePos = [...state.flagged].filter(id => !state.violationSet.has(id)).length;
    const falseNeg = [...state.violationSet].filter(id => !state.flagged.has(id)).length;
    const denom = truePos + falsePos + falseNeg || 1;
    const diagnosePct = Math.round((truePos / denom) * 100);

    document.getElementById('g10Violations').textContent = String(truePos);
    state.vera.updateCommentary(`diagnosis ${diagnosePct}%`);

    startChunkPhase(diagnosePct);
  }

  function startChunkPhase(diagnosePct) {
    state.phase = 2;
    state.diagnosePct = diagnosePct;
    document.getElementById('g10Instruction').textContent = 'Lasso-select items to create chunk groups.';
    document.getElementById('g10PhaseLabel').textContent = 'PHASE 2 - CHUNK';
    document.getElementById('g10PhaseDesc').textContent = 'Group items into meaningful chunks with clear labels.';
    showOnly('g10Phase2');
    renderChunkArea();
  }

  function renderChunkArea() {
    const area = document.getElementById('g10ChunkArea');
    area.innerHTML = '';

    const ungrouped = state.items.filter(item => !isGrouped(item.id));
    ungrouped.forEach((item, i) => {
      const chip = document.createElement('div');
      chip.className = 'miller-item';
      chip.dataset.id = item.id;
      chip.textContent = item.label;
      chip.style.position = 'absolute';
      chip.style.left = `${16 + (i % 8) * 78}px`;
      chip.style.top = `${16 + Math.floor(i / 8) * 44}px`;
      area.appendChild(chip);
    });

    state.groups.forEach((g, gi) => {
      const group = document.createElement('div');
      group.className = 'miller-group';
      group.style.position = 'absolute';
      group.style.left = `${24 + (gi % 3) * 210}px`;
      group.style.top = `${170 + Math.floor(gi / 3) * 100}px`;
      group.dataset.group = String(g.id);

      const label = document.createElement('span');
      label.className = 'miller-group-label';
      label.textContent = g.label;
      label.addEventListener('dblclick', () => ungroup(g.id));
      group.appendChild(label);

      g.items.forEach(id => {
        const item = state.items.find(x => x.id === id);
        if (!item) return;
        const chip = document.createElement('span');
        chip.className = 'miller-item';
        chip.style.position = 'static';
        chip.style.margin = '0';
        chip.textContent = item.label;
        group.appendChild(chip);
      });

      area.appendChild(group);
    });

    renderGroupCount();
  }

  function bindLasso() {
    const area = document.getElementById('g10ChunkArea');

    area.addEventListener('mousedown', e => {
      if (state.phase !== 2) return;
      if (e.target !== area) return;
      const rect = area.getBoundingClientRect();
      state.lassoStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      const lasso = document.createElement('div');
      lasso.className = 'miller-lasso';
      lasso.style.left = state.lassoStart.x + 'px';
      lasso.style.top = state.lassoStart.y + 'px';
      lasso.style.width = '1px';
      lasso.style.height = '1px';
      area.appendChild(lasso);
      state.lassoEl = lasso;
    });

    area.addEventListener('mousemove', e => {
      if (state.phase !== 2 || !state.lassoEl || !state.lassoStart) return;
      const rect = area.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const left = Math.min(x, state.lassoStart.x);
      const top = Math.min(y, state.lassoStart.y);
      const w = Math.abs(x - state.lassoStart.x);
      const h = Math.abs(y - state.lassoStart.y);
      state.lassoEl.style.left = left + 'px';
      state.lassoEl.style.top = top + 'px';
      state.lassoEl.style.width = w + 'px';
      state.lassoEl.style.height = h + 'px';
    });

    area.addEventListener('mouseup', () => {
      if (state.phase !== 2 || !state.lassoEl || !state.lassoStart) return;
      const box = rectFromEl(state.lassoEl);
      state.currentSelection = [];

      area.querySelectorAll('.miller-item[data-id]').forEach(el => {
        const r = rectFromEl(el);
        if (intersects(box, r)) state.currentSelection.push(el.dataset.id);
      });

      state.lassoEl.remove();
      state.lassoEl = null;
      state.lassoStart = null;

      if (state.currentSelection.length > 0) {
        createGroupFromSelection(state.currentSelection);
      }
    });

    document.addEventListener('keydown', e => {
      if (state.phase !== 2) return;
      if (e.key === 'Enter' && state.currentSelection.length > 0) {
        createGroupFromSelection(state.currentSelection);
      }
    });
  }

  function createGroupFromSelection(selection) {
    if (!selection.length) return;
    const unique = [...new Set(selection.filter(id => !isGrouped(id)))];
    if (!unique.length) return;

    const label = window.prompt('Group label:', 'Chunk');
    if (!label || !label.trim()) {
      state.vera.updateCommentary('group needs a meaningful label');
      return;
    }

    state.groups.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      label: label.trim(),
      items: unique,
    });

    state.currentSelection = [];
    renderChunkArea();
    state.vera.resetTimer();
    state.vera.updateCommentary(`${state.groups.length} groups created`);
  }

  function ungroup(groupId) {
    state.groups = state.groups.filter(g => g.id !== groupId);
    renderChunkArea();
  }

  function isGrouped(itemId) {
    return state.groups.some(g => g.items.includes(itemId));
  }

  function submitChunk() {
    const ch = CHALLENGES[state.idx];

    if (!state.groups.length) {
      state.vera.wrongAttempt();
      state.vera.updateCommentary('create at least one group');
      return;
    }

    const validSizeGroups = state.groups.filter(g => g.items.length <= 7 && g.items.length >= 2).length;
    const labelQuality = state.groups.filter(g => g.label.length >= 3).length;
    const groupedItems = state.groups.reduce((sum, g) => sum + g.items.length, 0);

    const chunkPct = Math.round(
      clamp((validSizeGroups / state.groups.length) * 0.45 + (labelQuality / state.groups.length) * 0.25 + (groupedItems / state.items.length) * 0.30, 0, 1) * 100
    );

    if (ch.snapshot) {
      state.memory[ch.id] = state.groups.map(g => ({ label: g.label, items: g.items.map(id => itemLabelById(id)) }));
    }

    if (ch.recalls) {
      startRecallPhase(ch, chunkPct);
      return;
    }

    finishChallenge(chunkPct, null);
  }

  function startRecallPhase(ch, chunkPct) {
    state.phase = 3;
    state.chunkPct = chunkPct;

    document.getElementById('g10Instruction').textContent = 'Reconstruct prior grouping from memory.';
    document.getElementById('g10PhaseLabel').textContent = 'PHASE 3 - RECALL';
    document.getElementById('g10PhaseDesc').textContent = `Recall grouping from Challenge ${ch.recallFrom}.`;
    showOnly('g10Phase3');

    const recallArea = document.getElementById('g10RecallArea');
    recallArea.innerHTML = '';

    const memory = state.memory[ch.recallFrom] || [];
    if (!memory.length) {
      const note = document.createElement('p');
      note.className = 'theory-text';
      note.textContent = 'No prior memory snapshot available. Continue to submit.';
      recallArea.appendChild(note);
      return;
    }

    memory.forEach(group => {
      const slot = document.createElement('div');
      slot.className = 'recall-group-slot';
      const title = document.createElement('span');
      title.className = 'recall-group-title';
      title.textContent = group.label;
      slot.appendChild(title);

      const inputs = [];
      for (let i = 0; i < Math.min(7, group.items.length); i++) {
        const input = document.createElement('input');
        input.className = 'recall-item-input';
        input.placeholder = 'Type remembered item';
        slot.appendChild(input);
        inputs.push(input);
      }

      state.recallInputs[group.label] = inputs;
      recallArea.appendChild(slot);
    });
  }

  function submitRecall() {
    const ch = CHALLENGES[state.idx];
    const memory = state.memory[ch.recallFrom] || [];
    if (!memory.length) {
      finishChallenge(state.chunkPct || 0, 0);
      return;
    }

    let correct = 0;
    let total = 0;

    memory.forEach(group => {
      const expected = new Set(group.items.map(x => x.toLowerCase()));
      const inputs = state.recallInputs[group.label] || [];
      inputs.forEach(input => {
        const value = input.value.trim().toLowerCase();
        if (!value) return;
        total++;
        if (expected.has(value)) correct++;
      });
    });

    const recallPct = total ? Math.round((correct / total) * 100) : 0;
    finishChallenge(state.chunkPct || 0, recallPct);
  }

  function finishChallenge(chunkPct, recallPct) {
    state.showingDebrief = true;

    const diagnoseScore = Math.round((state.diagnosePct || 0) * 0.35);
    const chunkScore = Math.round((chunkPct || 0) * 0.45);
    const recallScore = recallPct == null ? 0 : Math.round((recallPct || 0) * 0.20);

    let score = diagnoseScore + chunkScore + recallScore;
    const elapsed = (Date.now() - state.startTime) / 1000;
    if (elapsed < 140) score += 10;
    if (!state.vera.wasHintUsed()) score += 15;
    score = clamp(score, 0, 125);

    state.scores.push(score);

    const totalScore = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g10Score').textContent = totalScore;
    document.getElementById('g10ScoreRight').textContent = totalScore;

    document.getElementById('g10DebriefGood').textContent =
      `Diagnose ${state.diagnosePct || 0}%, chunk ${chunkPct || 0}%${recallPct == null ? '' : `, recall ${recallPct}%`}.`;
    document.getElementById('g10DebriefMiss').textContent =
      (chunkPct || 0) < 70 ? 'Keep groups smaller than 7 and label by semantic meaning, not UI position.' :
      "Strong chunking discipline aligned with Miller's limit.";

    const overlay = document.getElementById('g10Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('miller chunking evaluated');
  }

  function nextChallenge() {
    const overlay = document.getElementById('g10Debrief');
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
    saved.G10 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('cognitive_game_scores', JSON.stringify(saved));

    const prog = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!prog.completedGames) prog.completedGames = [];
    if (!prog.completedGames.includes('G10')) prog.completedGames.push('G10');
    prog.totalXP = (prog.totalXP || 0) + xp;
    if (!prog.skillLevels) prog.skillLevels = {};
    prog.skillLevels.cognitive = Math.min(100, (prog.skillLevels.cognitive || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(prog));

    document.getElementById('g10XP').textContent = `+${xp} XP`;
    document.getElementById('g10PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g10Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));

    const el = document.getElementById('g10FinalScore');
    let cur = 0;
    const step = Math.ceil(avg / 60);
    const timer = setInterval(() => {
      cur = Math.min(cur + step, avg);
      el.textContent = cur;
      if (cur >= avg) clearInterval(timer);
    }, 16);
  }

  function renderGroupCount() {
    document.getElementById('g10GroupCount').textContent = String(state.groups.length);
  }

  function showOnly(phaseId) {
    ['g10Phase1', 'g10Phase2', 'g10Phase3'].forEach(id => {
      document.getElementById(id).style.display = id === phaseId ? 'block' : 'none';
    });
  }

  function rectFromEl(el) {
    const root = document.getElementById('g10ChunkArea').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      left: r.left - root.left,
      top: r.top - root.top,
      right: r.right - root.left,
      bottom: r.bottom - root.top,
    };
  }

  function intersects(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  function itemLabelById(id) {
    const item = state.items.find(x => x.id === id);
    return item ? item.label : '';
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
