/* G2SimilarityMatch.js — Similarity Law game */
(function () {
  'use strict';

  // ── Challenge definitions ──────────────────────────────────────
  const CHALLENGES = [
    {
      id: 1, label: 'Nav Bar — Mixed Buttons',
      instruction: 'Unify the navigation buttons so they look like a consistent group.',
      groups: [
        { id: 'nav-primary', label: 'Primary Nav Links', elements: ['Home','About','Services','Contact'], type: 'nav', shouldMatch: true,  baseColor: '#6366F1', baseSize: 100, baseRound: 6, baseWeight: 600 },
        { id: 'nav-cta',     label: 'CTA Button',        elements: ['Sign Up'],                          type: 'btn', shouldMatch: false, baseColor: '#4ADE80', baseSize: 100, baseRound: 6, baseWeight: 700 },
      ],
      targetScore: 80,
    },
    {
      id: 2, label: 'Nav Bar — Icon Styles',
      instruction: 'Make all icon-style nav items visually consistent.',
      groups: [
        { id: 'icon-nav', label: 'Icon Nav', elements: ['🏠 Home','📦 Products','👤 Profile','⚙️ Settings'], type: 'nav', shouldMatch: true, baseColor: '#6366F1', baseSize: 100, baseRound: 4, baseWeight: 500 },
        { id: 'icon-action', label: 'Action', elements: ['🔔 Alerts'], type: 'btn', shouldMatch: false, baseColor: '#F59E0B', baseSize: 110, baseRound: 50, baseWeight: 700 },
      ],
      targetScore: 80,
    },
    {
      id: 3, label: 'Form — Inconsistent Inputs',
      instruction: 'Fix the form inputs so all related fields look the same.',
      groups: [
        { id: 'form-inputs', label: 'Text Inputs', elements: ['Name','Email','Phone'], type: 'input', shouldMatch: true, baseColor: '#2A2A2A', baseSize: 100, baseRound: 6, baseWeight: 400 },
        { id: 'form-submit', label: 'Submit',      elements: ['Submit'],              type: 'btn',   shouldMatch: false, baseColor: '#6366F1', baseSize: 110, baseRound: 6, baseWeight: 700 },
      ],
      targetScore: 80,
    },
    {
      id: 4, label: 'Form — Label Styles',
      instruction: 'Unify all form labels to share the same visual weight.',
      groups: [
        { id: 'labels', label: 'Labels', elements: ['Username','Password','Confirm Password'], type: 'label', shouldMatch: true, baseColor: '#E0E0FF', baseSize: 100, baseRound: 0, baseWeight: 600 },
        { id: 'hints',  label: 'Hints',  elements: ['Must be 8+ chars'],                      type: 'hint',  shouldMatch: false, baseColor: '#888',   baseSize: 85,  baseRound: 0, baseWeight: 400 },
      ],
      targetScore: 80,
    },
    {
      id: 5, label: 'Dashboard — Mixed Icons',
      instruction: 'Align all dashboard icons to a consistent visual style.',
      groups: [
        { id: 'dash-icons', label: 'Dashboard Icons', elements: ['📊 Analytics','📈 Growth','💰 Revenue','👥 Users'], type: 'icon', shouldMatch: true, baseColor: '#6366F1', baseSize: 100, baseRound: 8, baseWeight: 500 },
        { id: 'dash-alert', label: 'Alert',           elements: ['⚠️ Warning'],                                       type: 'icon', shouldMatch: false, baseColor: '#EF4444', baseSize: 120, baseRound: 50, baseWeight: 700 },
      ],
      targetScore: 80,
    },
    {
      id: 6, label: 'Dashboard — Card Headers',
      instruction: 'Make all card headers visually consistent.',
      groups: [
        { id: 'card-heads', label: 'Card Headers', elements: ['Total Sales','Active Users','Conversion','Bounce Rate'], type: 'card-head', shouldMatch: true, baseColor: '#E0E0FF', baseSize: 100, baseRound: 0, baseWeight: 700 },
        { id: 'card-sub',   label: 'Subtitles',    elements: ['vs last month'],                                         type: 'card-sub',  shouldMatch: false, baseColor: '#888',   baseSize: 85,  baseRound: 0, baseWeight: 400 },
      ],
      targetScore: 80,
    },
    {
      id: 7, label: 'E-Commerce — Product Grid',
      instruction: 'Fix the product card visual system — prices, titles, and CTAs.',
      groups: [
        { id: 'prod-title', label: 'Product Titles', elements: ['Sneakers','Jacket','Watch','Bag'],    type: 'prod-title', shouldMatch: true, baseColor: '#E0E0FF', baseSize: 100, baseRound: 0, baseWeight: 700 },
        { id: 'prod-price', label: 'Prices',         elements: ['$99','$149','$249','$79'],            type: 'prod-price', shouldMatch: true, baseColor: '#4ADE80', baseSize: 110, baseRound: 0, baseWeight: 800 },
        { id: 'prod-cta',   label: 'Add to Cart',    elements: ['Add','Add','Add','Add'],              type: 'btn',        shouldMatch: true, baseColor: '#6366F1', baseSize: 100, baseRound: 4, baseWeight: 600 },
      ],
      targetScore: 80,
    },
    {
      id: 8, label: 'E-Commerce — Filters',
      instruction: 'Unify the filter tags so active and inactive states are clear.',
      groups: [
        { id: 'filter-active',   label: 'Active Filters',   elements: ['Size: M','Color: Black'],          type: 'tag', shouldMatch: true, baseColor: '#6366F1', baseSize: 100, baseRound: 20, baseWeight: 600 },
        { id: 'filter-inactive', label: 'Inactive Filters', elements: ['Size: S','Size: L','Color: White'], type: 'tag', shouldMatch: true, baseColor: '#2A2A2A', baseSize: 100, baseRound: 20, baseWeight: 400 },
      ],
      targetScore: 80,
    },
    {
      id: 9, label: 'Landing Page — Full Audit',
      instruction: 'Fix all similarity violations across this landing page.',
      groups: [
        { id: 'lp-h1',   label: 'H1 Headings',  elements: ['Hero Title','Section Title'],    type: 'h1',  shouldMatch: true, baseColor: '#fff',    baseSize: 100, baseRound: 0, baseWeight: 900 },
        { id: 'lp-body', label: 'Body Text',     elements: ['Paragraph 1','Paragraph 2'],    type: 'body',shouldMatch: true, baseColor: '#E0E0FF', baseSize: 100, baseRound: 0, baseWeight: 400 },
        { id: 'lp-cta',  label: 'CTA Buttons',   elements: ['Get Started','Learn More'],     type: 'btn', shouldMatch: true, baseColor: '#6366F1', baseSize: 100, baseRound: 6, baseWeight: 700 },
      ],
      targetScore: 80,
    },
    {
      id: 10, label: 'Landing Page — Timed',
      instruction: 'Fix all similarity violations — you have 90 seconds.',
      timeLimit: 90,
      groups: [
        { id: 'tl-nav',  label: 'Nav Links',    elements: ['Home','Features','Pricing','Docs'], type: 'nav',  shouldMatch: true, baseColor: '#E0E0FF', baseSize: 100, baseRound: 0, baseWeight: 500 },
        { id: 'tl-feat', label: 'Feature Icons',elements: ['⚡ Fast','🔒 Secure','🌍 Global'],  type: 'icon', shouldMatch: true, baseColor: '#6366F1', baseSize: 100, baseRound: 8, baseWeight: 500 },
        { id: 'tl-cta',  label: 'CTAs',         elements: ['Try Free','Buy Now'],              type: 'btn',  shouldMatch: true, baseColor: '#4ADE80', baseSize: 100, baseRound: 6, baseWeight: 700 },
      ],
      targetScore: 80,
    },
  ];

  // ── State ──────────────────────────────────────────────────────
  let state = {
    challengeIdx: 0,
    scores: [],
    selectedGroup: null,
    groupStates: {},
    showingOriginal: false,
    timerInterval: null,
    timeLeft: 0,
    startTime: 0,
    vera: null,
    showingDebrief: false,
  };

  // ── Init ───────────────────────────────────────────────────────
  function init() {
    document.getElementById('g2Brief').addEventListener('click', startGame);
    document.getElementById('g2TheoryToggle').addEventListener('click', () => {
      document.getElementById('g2Theory').classList.toggle('collapsed');
    });
    document.getElementById('g2Next').addEventListener('click', nextChallenge);
    document.getElementById('g2Return').addEventListener('click', () => window.returnToDashboard());
    document.getElementById('g2Submit').addEventListener('click', submitChallenge);
    document.getElementById('g2BeforeAfter').addEventListener('click', toggleOriginal);

    // Sliders
    ['g2Hue','g2Size','g2Round','g2Weight'].forEach(id => {
      document.getElementById(id).addEventListener('input', onSliderChange);
    });

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g2VeraOrb',
      commentId: 'g2VeraComment',
      hintQuestion: 'Which elements should look the same? Which should look different?',
      interventionText: 'Select a group, then adjust sliders until related items share all visual properties.',
    });
  }

  function startGame() {
    const brief = document.getElementById('g2Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 400);
    document.getElementById('g2Header').style.display = 'flex';
    document.getElementById('g2Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  // ── Challenge loading ──────────────────────────────────────────
  function loadChallenge(idx) {
    state.challengeIdx = idx;
    state.selectedGroup = null;
    state.showingOriginal = false;
    state.startTime = Date.now();
    const ch = CHALLENGES[idx];

    document.getElementById('g2Counter').textContent =
      `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;

    // Init group states from challenge defaults
    state.groupStates = {};
    ch.groups.forEach(g => {
      state.groupStates[g.id] = {
        hue: 0, size: g.baseSize, round: g.baseRound, weight: g.baseWeight,
        color: g.baseColor,
      };
    });

    // Timer
    clearInterval(state.timerInterval);
    if (ch.timeLimit) {
      state.timeLeft = ch.timeLimit;
      state.timerInterval = setInterval(() => {
        state.timeLeft--;
        if (state.timeLeft <= 0) { clearInterval(state.timerInterval); submitChallenge(); }
      }, 1000);
    }

    renderPreview(false);
    updateSimScore();
    state.vera.updateCommentary('select a group — then adjust sliders');
  }

  // ── Render preview ─────────────────────────────────────────────
  function renderPreview(original) {
    const ch = CHALLENGES[state.challengeIdx];
    const preview = document.getElementById('g2Preview');

    preview.innerHTML = ch.groups.map(g => {
      const gs = original ? { hue: 0, size: g.baseSize, round: g.baseRound, weight: g.baseWeight, color: g.baseColor }
                          : state.groupStates[g.id];
      const isSelected = state.selectedGroup === g.id;
      const outline = isSelected ? '2px dashed #6366F1' : '2px solid transparent';

      const items = g.elements.map(label => {
        const style = buildStyle(g.type, gs, original ? null : gs);
        return `<span class="sim-item" style="${style}">${label}</span>`;
      }).join('');

      return `
        <div class="sim-group" data-gid="${g.id}"
             style="margin-bottom:20px;padding:12px;border:${outline};border-radius:4px;cursor:pointer;">
          <p style="font-family:var(--ff-mono);font-size:9px;letter-spacing:1px;color:#6366F1;margin-bottom:8px;">${g.label}</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">${items}</div>
        </div>`;
    }).join('');

    // Group click handlers
    preview.querySelectorAll('.sim-group').forEach(el => {
      el.addEventListener('click', () => selectGroup(el.dataset.gid));
    });
  }

  function buildStyle(type, gs) {
    const hueFilter = gs.hue !== 0 ? `hue-rotate(${gs.hue}deg)` : '';
    const scale = gs.size / 100;
    const base = `
      font-family: var(--ff-body);
      font-weight: ${gs.weight};
      border-radius: ${gs.round}px;
      transform: scale(${scale});
      transform-origin: left center;
      display: inline-block;
      filter: ${hueFilter};
      transition: all 0.2s;
    `;
    switch (type) {
      case 'nav':
        return base + `padding:8px 16px;color:${gs.color};background:transparent;`;
      case 'btn':
        return base + `padding:10px 20px;background:${gs.color};color:#fff;border:none;cursor:pointer;`;
      case 'input':
        return base + `padding:10px 14px;background:${gs.color};border:1px solid #444;color:#E0E0FF;width:160px;`;
      case 'label':
        return base + `color:${gs.color};font-size:13px;`;
      case 'hint':
        return base + `color:${gs.color};font-size:11px;font-style:italic;`;
      case 'icon':
        return base + `padding:10px;background:${gs.color}22;color:${gs.color};border-radius:${gs.round}px;`;
      case 'tag':
        return base + `padding:6px 14px;background:${gs.color};color:#fff;font-size:12px;`;
      case 'card-head':
        return base + `color:${gs.color};font-size:16px;`;
      case 'card-sub':
        return base + `color:${gs.color};font-size:12px;`;
      case 'prod-title':
        return base + `color:${gs.color};font-size:15px;`;
      case 'prod-price':
        return base + `color:${gs.color};font-size:18px;`;
      case 'h1':
        return base + `color:${gs.color};font-size:22px;font-family:var(--ff-title);`;
      case 'body':
        return base + `color:${gs.color};font-size:14px;line-height:1.6;`;
      default:
        return base + `color:${gs.color};`;
    }
  }

  function selectGroup(gid) {
    state.selectedGroup = gid;
    const ch = CHALLENGES[state.challengeIdx];
    const g  = ch.groups.find(x => x.id === gid);
    const gs = state.groupStates[gid];

    // Sync sliders
    document.getElementById('g2Hue').value    = gs.hue;
    document.getElementById('g2Size').value   = gs.size;
    document.getElementById('g2Round').value  = gs.round;
    document.getElementById('g2Weight').value = gs.weight;
    document.getElementById('g2HueVal').textContent    = gs.hue + '°';
    document.getElementById('g2SizeVal').textContent   = gs.size + '%';
    document.getElementById('g2RoundVal').textContent  = gs.round + 'px';
    document.getElementById('g2WeightVal').textContent = gs.weight;

    renderPreview(false);
    state.vera.updateCommentary(`"${g.label}" selected — adjust sliders`);
  }

  function onSliderChange() {
    if (!state.selectedGroup) return;
    const gs = state.groupStates[state.selectedGroup];
    gs.hue    = parseInt(document.getElementById('g2Hue').value);
    gs.size   = parseInt(document.getElementById('g2Size').value);
    gs.round  = parseInt(document.getElementById('g2Round').value);
    gs.weight = parseInt(document.getElementById('g2Weight').value);

    document.getElementById('g2HueVal').textContent    = gs.hue + '°';
    document.getElementById('g2SizeVal').textContent   = gs.size + '%';
    document.getElementById('g2RoundVal').textContent  = gs.round + 'px';
    document.getElementById('g2WeightVal').textContent = gs.weight;

    renderPreview(false);
    updateSimScore();
  }

  function toggleOriginal() {
    state.showingOriginal = !state.showingOriginal;
    const btn = document.getElementById('g2BeforeAfter');
    btn.textContent = state.showingOriginal ? 'CURRENT' : 'ORIGINAL';
    btn.classList.toggle('active', state.showingOriginal);
    renderPreview(state.showingOriginal);
  }

  // ── Similarity score ───────────────────────────────────────────
  function updateSimScore() {
    const score = calcSimScore();
    document.getElementById('g2SimScore').textContent = score + '%';
    state.vera.updateCommentary(
      score > 80 ? 'strong similarity — visual system cohesive'
      : score > 50 ? 'partial similarity — keep adjusting'
      : '3 elements claim to be related — but share no visual property'
    );
  }

  function calcSimScore() {
    const ch = CHALLENGES[state.challengeIdx];
    let totalPoints = 0;
    let maxPoints = 0;

    ch.groups.forEach(g => {
      const gs = state.groupStates[g.id];
      if (g.shouldMatch) {
        // Reward: size close to base, round close to base, weight close to base
        const sizeScore   = 100 - Math.abs(gs.size   - g.baseSize);
        const roundScore  = 100 - Math.abs(gs.round  - g.baseRound) * 2;
        const weightScore = 100 - Math.abs(gs.weight - g.baseWeight) / 4;
        totalPoints += Math.max(0, sizeScore) + Math.max(0, roundScore) + Math.max(0, weightScore);
        maxPoints += 300;
      }
    });

    if (maxPoints === 0) return 85;
    return Math.min(100, Math.round((totalPoints / maxPoints) * 100));
  }

  // ── Submit ─────────────────────────────────────────────────────
  function submitChallenge() {
    if (state.showingDebrief) return;
    state.showingDebrief = true;
    clearInterval(state.timerInterval);

    const simScore = calcSimScore();
    const ch = CHALLENGES[state.challengeIdx];
    let score = simScore;
    const elapsed = (Date.now() - state.startTime) / 1000;
    const limit = ch.timeLimit || 120;
    if (elapsed < limit * 0.5) score += 10;
    if (!state.vera.wasHintUsed()) score += 15;
    score = Math.max(0, Math.min(125, score));
    state.scores.push(score);

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g2Score').textContent = total;
    document.getElementById('g2ScoreRight').textContent = total;

    const good = simScore >= ch.targetScore
      ? `Similarity score ${simScore}% — visual system is cohesive.`
      : `Similarity score ${simScore}% — some groups still inconsistent.`;
    const miss = simScore < ch.targetScore
      ? 'Related elements must share color, size, shape, and weight to signal relationship.'
      : '';

    document.getElementById('g2DebriefGood').textContent = good;
    document.getElementById('g2DebriefMiss').textContent = miss;

    const overlay = document.getElementById('g2Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('similarity principle applied');
  }

  function nextChallenge() {
    const overlay = document.getElementById('g2Debrief');
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
    saved['G02'] = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('gestalt_game_scores', JSON.stringify(saved));

    const prog = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!prog.completedGames) prog.completedGames = [];
    if (!prog.completedGames.includes('G02')) prog.completedGames.push('G02');
    prog.totalXP = (prog.totalXP || 0) + xp;
    if (!prog.skillLevels) prog.skillLevels = {};
    prog.skillLevels.gestalt = Math.min(100, (prog.skillLevels.gestalt || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(prog));

    document.getElementById('g2XP').textContent = `+${xp} XP`;
    document.getElementById('g2PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g2Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));

    const el = document.getElementById('g2FinalScore');
    let cur = 0;
    const step = Math.ceil(avg / 60);
    const counter = setInterval(() => {
      cur = Math.min(cur + step, avg);
      el.textContent = cur;
      if (cur >= avg) clearInterval(counter);
    }, 16);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
