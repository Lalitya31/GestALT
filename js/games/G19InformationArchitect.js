(() => {
  'use strict';

  const NAV_PATTERNS = ['Hamburger', 'Tab bar', 'Mega menu', 'Hub and spoke', 'Sequential flow', 'Faceted browse'];

  const DOMAINS = [
    'E-commerce', 'E-commerce', 'E-commerce',
    'SaaS', 'SaaS',
    'Government', 'Government',
    'Healthcare', 'Healthcare',
    'Novel Product Category',
  ];

  const BASE_ITEMS = [
    'Shipping policy', 'My orders', 'Product reviews', 'Track package', 'Return request', 'Gift cards', 'Account settings', 'Wishlist',
    'Saved payment methods', 'Cancel order', 'Order invoice', 'Promo codes', 'Subscription plans', 'Two-factor authentication',
    'Notification preferences', 'Address book', 'Language settings', 'Privacy controls', 'Data export', 'Support tickets',
    'Live chat', 'FAQ', 'Refund policy', 'Delivery options', 'Store locator', 'Rewards points', 'Referral program',
    'Security logins', 'Connected apps', 'Billing history', 'Invoices', 'Tax documents', 'Reports', 'API keys', 'Team members',
    'Role permissions', 'Audit log', 'Integrations', 'Workflow templates', 'Activity feed', 'Search history', 'Archived items',
    'Emergency contact', 'Medication list', 'Appointments', 'Lab results', 'Insurance details', 'Care plans', 'Consent forms',
    'Accessibility preferences', 'Session timeout', 'Data retention', 'Profile photo', 'Community guidelines', 'Feedback form',
    'Delete account', 'Reactivate account', 'Onboarding checklist', 'Feature requests',
  ];

  const state = {
    idx: 0,
    scores: [],
    phase: 1,
    items: [],
    selected: new Set(),
    clusters: [],
    buckets: [],
    bucketMap: {},
    treeTasks: [],
    treeProgress: 0,
    treeSuccess: 0,
    pattern: NAV_PATTERNS[0],
    vera: null,
    showingDebrief: false,
  };

  function init() {
    const brief = document.getElementById('g19Brief');
    if (!brief) return;

    brief.addEventListener('click', start);
    document.getElementById('g19TheoryToggle').addEventListener('click', () => {
      document.getElementById('g19Theory').classList.toggle('collapsed');
    });

    document.getElementById('g19CreateCluster').addEventListener('click', createCluster);
    document.getElementById('g19AddBucket').addEventListener('click', addBucket);
    document.getElementById('g19RunTree').addEventListener('click', runTreeTask);
    document.getElementById('g19QuickRetest').addEventListener('click', quickRetest);
    document.getElementById('g19Pattern').addEventListener('change', e => {
      state.pattern = e.target.value;
      renderPatternPreview();
    });

    document.getElementById('g19ToPhase2').addEventListener('click', () => setPhase(2));
    document.getElementById('g19ToPhase3').addEventListener('click', () => setPhase(3));
    document.getElementById('g19ToPhase4').addEventListener('click', () => setPhase(4));
    document.getElementById('g19Submit').addEventListener('click', submit);
    document.getElementById('g19Next').addEventListener('click', next);
    document.getElementById('g19Return').addEventListener('click', () => window.returnToDashboard());

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g19VeraOrb',
      commentId: 'g19VeraComment',
      hintQuestion: 'What task would a stressed first-time user complete first?',
      interventionText: 'Split overloaded groups and rename labels for intent clarity.',
    });
  }

  function start() {
    const brief = document.getElementById('g19Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 320);
    document.getElementById('g19Header').style.display = 'flex';
    document.getElementById('g19Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.idx = idx;
    state.phase = 1;
    state.selected = new Set();
    state.clusters = [];
    state.buckets = [];
    state.bucketMap = {};
    state.treeTasks = [];
    state.treeProgress = 0;
    state.treeSuccess = 0;
    state.showingDebrief = false;

    const count = idx < 3 ? 40 : (idx < 5 ? 50 : (idx < 9 ? 55 : 60));
    state.items = shuffle([...BASE_ITEMS]).slice(0, count);

    document.getElementById('g19Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
    document.getElementById('g19Scenario').textContent = `${DOMAINS[idx]} IA — ${count} content items`;

    const pat = document.getElementById('g19Pattern');
    pat.innerHTML = NAV_PATTERNS.map(x => `<option>${x}</option>`).join('');
    pat.value = state.pattern;

    renderAll();
    state.vera.resetTimer();
  }

  function renderAll() {
    renderPhaseState();
    renderDump();
    renderClusters();
    renderBuckets();
    renderTree();
    renderPatternPreview();
    updateMetrics();
  }

  function renderPhaseState() {
    [1, 2, 3, 4].forEach(p => {
      const el = document.getElementById(`g19P${p}`);
      if (el) el.style.display = state.phase === p ? 'block' : 'none';
    });
  }

  function renderDump() {
    const wrap = document.getElementById('g19Dump');
    wrap.innerHTML = '';
    state.items.forEach((it, idx) => {
      const chip = document.createElement('button');
      chip.className = 'ia-chip';
      chip.textContent = it;
      chip.dataset.idx = String(idx);
      if (state.selected.has(idx)) chip.classList.add('selected');
      chip.addEventListener('click', () => {
        if (state.selected.has(idx)) state.selected.delete(idx);
        else state.selected.add(idx);
        renderDump();
      });
      wrap.appendChild(chip);
    });
  }

  function createCluster() {
    const label = document.getElementById('g19ClusterLabel').value.trim();
    if (!label || !state.selected.size) return;
    state.clusters.push({
      label,
      items: [...state.selected].map(i => state.items[i]),
    });
    state.selected = new Set();
    document.getElementById('g19ClusterLabel').value = '';
    renderClusters();
    updateMetrics();
  }

  function renderClusters() {
    const out = document.getElementById('g19Clusters');
    out.innerHTML = state.clusters.map(c => `<div class="ia-cluster"><strong>${c.label}</strong> <span>${c.items.length} items</span></div>`).join('');
  }

  function addBucket() {
    const name = `Bucket ${state.buckets.length + 1}`;
    const id = `b${state.buckets.length + 1}`;
    state.buckets.push({ id, name, logic: '', items: [] });
    renderBuckets();
  }

  function renderBuckets() {
    const col = document.getElementById('g19Buckets');
    col.innerHTML = '';

    state.buckets.forEach(bucket => {
      const box = document.createElement('div');
      box.className = 'ia-bucket';
      box.innerHTML = `<input class="ia-bucket-name" value="${bucket.name}"><textarea class="ia-bucket-logic" placeholder="Mental model for this group">${bucket.logic}</textarea><div class="ia-bucket-items"></div>`;

      box.querySelector('.ia-bucket-name').addEventListener('input', e => {
        bucket.name = e.target.value;
        updateMetrics();
      });
      box.querySelector('.ia-bucket-logic').addEventListener('input', e => {
        bucket.logic = e.target.value;
      });

      const itemWrap = box.querySelector('.ia-bucket-items');
      state.items.forEach(item => {
        const token = document.createElement('button');
        token.className = 'ia-token';
        token.textContent = item;
        token.addEventListener('click', () => {
          assignToBucket(item, bucket.id);
        });
        if (state.bucketMap[item] === bucket.id) token.classList.add('assigned');
        itemWrap.appendChild(token);
      });

      col.appendChild(box);
    });
  }

  function assignToBucket(item, bucketId) {
    state.bucketMap[item] = bucketId;
    state.buckets.forEach(b => {
      b.items = Object.keys(state.bucketMap).filter(k => state.bucketMap[k] === b.id);
    });
    renderBuckets();
    updateMetrics();
  }

  function setPhase(n) {
    state.phase = n;
    if (n === 3 && state.treeTasks.length === 0) {
      state.treeTasks = buildTreeTasks();
      state.treeProgress = 0;
      state.treeSuccess = 0;
    }
    renderPhaseState();
    renderTree();
  }

  function buildTreeTasks() {
    const candidates = shuffle([...state.items]).slice(0, 10);
    return candidates.map(item => ({
      prompt: `Find where a user expects "${item}"`,
      item,
      attempted: false,
      correct: false,
    }));
  }

  function renderTree() {
    const panel = document.getElementById('g19Tree');
    if (state.phase !== 3 && state.phase !== 4) {
      panel.innerHTML = '';
      return;
    }

    const current = state.treeTasks[state.treeProgress];
    if (!current) {
      panel.innerHTML = '<p>Tree tasks complete.</p>';
      return;
    }

    panel.innerHTML = `<p class="ia-task">${current.prompt}</p><div id="g19TreeChoices" class="ia-choices"></div><p class="ia-task-meta">Task ${state.treeProgress + 1}/${state.treeTasks.length}</p>`;
    const choices = document.getElementById('g19TreeChoices');

    state.buckets.forEach(bucket => {
      const c = document.createElement('button');
      c.className = 'ia-choice';
      c.textContent = bucket.name;
      c.addEventListener('click', () => evaluateTree(bucket.id));
      choices.appendChild(c);
    });
  }

  function evaluateTree(bucketId) {
    const task = state.treeTasks[state.treeProgress];
    if (!task) return;

    const correctBucket = state.bucketMap[task.item];
    task.attempted = true;
    task.correct = correctBucket === bucketId;
    if (task.correct) state.treeSuccess += 1;

    if (!task.correct) {
      state.vera.updateCommentary('Users got lost in this branch. Rename or regroup this path.');
    }

    state.treeProgress += 1;
    renderTree();
    updateMetrics();
  }

  function runTreeTask() {
    if (state.phase !== 3) setPhase(3);
    renderTree();
  }

  function quickRetest() {
    if (state.phase !== 4) setPhase(4);
    const tasks = buildTreeTasks().slice(0, 5);
    let hit = 0;
    tasks.forEach(t => {
      if (state.bucketMap[t.item]) hit += 1;
    });
    document.getElementById('g19QuickResult').textContent = `Quick retest: ${hit}/5 likely first-try success`;
  }

  function renderPatternPreview() {
    document.getElementById('g19PatternPreview').textContent = `${state.pattern}: preview mapped to your current IA groups.`;
  }

  function updateMetrics() {
    const assigned = Object.keys(state.bucketMap).length;
    const total = state.items.length;

    const treeRate = state.treeTasks.length ? (state.treeSuccess / Math.max(1, state.treeProgress)) : 0;
    const overloaded = state.buckets.filter(b => b.items.length > 7).length;
    const labelQuality = state.buckets.length ? state.buckets.filter(b => b.name.trim().length >= 4).length / state.buckets.length : 0;

    document.getElementById('g19Assigned').textContent = `${assigned}/${total}`;
    document.getElementById('g19TreeRate').textContent = `${Math.round(treeRate * 100)}%`;
    document.getElementById('g19Miller').textContent = overloaded === 0 ? 'PASS' : `WARN (${overloaded})`;
    document.getElementById('g19Label').textContent = `${Math.round(labelQuality * 100)}%`;

    if (overloaded > 0) state.vera.updateCommentary('One or more groups exceed Miller limits. Split overloaded buckets.');
  }

  function submit() {
    if (state.showingDebrief) return;

    const treeRate = state.treeTasks.length ? state.treeSuccess / Math.max(1, state.treeTasks.length) : 0;
    const overloaded = state.buckets.filter(b => b.items.length > 7).length;
    const miller = overloaded === 0 ? 1 : clamp(1 - overloaded / Math.max(1, state.buckets.length), 0, 1);
    const label = state.buckets.length ? state.buckets.filter(b => b.name.trim().length >= 4).length / state.buckets.length : 0;

    let score = Math.round((treeRate * 0.45 + miller * 0.3 + label * 0.25) * 100);
    if (!state.vera.wasHintUsed()) score += 10;
    score = clamp(score, 0, 125);

    state.scores.push(score);
    state.showingDebrief = true;

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g19Score').textContent = String(total);

    document.getElementById('g19DebriefGood').textContent = `Tree success ${Math.round(treeRate * 100)}%. Miller compliance ${Math.round(miller * 100)}%.`;
    document.getElementById('g19DebriefMiss').textContent =
      overloaded > 0
        ? 'At least one category overloads working memory. Merge and split with clearer labels.'
        : 'Structure is coherent and wayfinding is strong.';

    const overlay = document.getElementById('g19Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('information architecture refined');
  }

  function next() {
    const overlay = document.getElementById('g19Debrief');
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.style.display = 'none'; }, 280);
    state.showingDebrief = false;

    const nextIdx = state.idx + 1;
    if (nextIdx >= 10) {
      showComplete();
      return;
    }
    loadChallenge(nextIdx);
  }

  function showComplete() {
    const total = state.scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / state.scores.length);
    const xp = avg * 10;

    const saved = JSON.parse(localStorage.getItem('strategy_game_scores') || '{}');
    saved.G19 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('strategy_game_scores', JSON.stringify(saved));

    const progress = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!progress.completedGames) progress.completedGames = [];
    if (!progress.completedGames.includes('G19')) progress.completedGames.push('G19');
    progress.totalXP = (progress.totalXP || 0) + xp;
    if (!progress.skillLevels) progress.skillLevels = {};
    progress.skillLevels.strategy = Math.min(100, (progress.skillLevels.strategy || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(progress));

    document.getElementById('g19FinalScore').textContent = String(avg);
    document.getElementById('g19XP').textContent = `+${xp} XP`;
    document.getElementById('g19PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g19Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
