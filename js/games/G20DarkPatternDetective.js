(() => {
  'use strict';

  const TYPES = [
    'TRICK QUESTIONS',
    'ROACH MOTEL',
    'CONFIRMSHAMING',
    'MISDIRECTION',
    'HIDDEN COSTS',
    'DISGUISED ADS',
    'FORCED CONTINUITY',
    'PRIVACY ZUCKERING',
    'BAIT AND SWITCH',
    'URGENCY MANUFACTURING',
  ];

  const CASES = Array.from({ length: 15 }).map((_, i) => {
    const count = i < 3 ? 3 : (i < 10 ? 5 : 6);
    return {
      id: i + 1,
      title: i < 3 ? `Intro case ${i + 1}` :
        (i < 5 ? `Checkout flow ${i + 1}` :
          (i < 7 ? `Cancellation flow ${i + 1}` :
            (i < 9 ? `Consent flow ${i + 1}` :
              (i === 9 ? 'Mobile game children UX' :
                (i === 10 ? 'Airline booking' :
                  (i === 11 ? 'Social engagement manipulation' :
                    (i === 12 ? 'Ethical redesign challenge' : `Reverse challenge ${i + 1}`))))))),
      findings: sampleTypes(count),
      hasNonPattern: i >= 12,
    };
  });

  const state = {
    idx: 0,
    scores: [],
    highlights: [],
    evidence: [],
    selectedHighlight: null,
    redesign: {},
    phase: 'investigate',
    drawStart: null,
    currentRect: null,
    vera: null,
    showingDebrief: false,
  };

  function init() {
    const brief = document.getElementById('g20Brief');
    if (!brief) return;

    brief.addEventListener('click', start);
    document.getElementById('g20TheoryToggle').addEventListener('click', () => {
      document.getElementById('g20Theory').classList.toggle('collapsed');
    });

    const canvas = document.getElementById('g20Canvas');
    canvas.addEventListener('pointerdown', onDrawStart);
    canvas.addEventListener('pointermove', onDrawMove);
    window.addEventListener('pointerup', onDrawEnd);

    document.getElementById('g20Classify').addEventListener('click', classifySelected);
    document.getElementById('g20ToRedesign').addEventListener('click', toRedesign);
    document.getElementById('g20Submit').addEventListener('click', submit);
    document.getElementById('g20Next').addEventListener('click', next);
    document.getElementById('g20Return').addEventListener('click', () => window.returnToDashboard());

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g20VeraOrb',
      commentId: 'g20VeraComment',
      hintQuestion: 'Read this sentence out loud. Does it feel honest?',
      interventionText: 'Not every suspicious pattern is a dark pattern. Verify intent and impact.',
    });
  }

  function start() {
    const brief = document.getElementById('g20Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 320);
    document.getElementById('g20Header').style.display = 'flex';
    document.getElementById('g20Arena').style.display = 'flex';
    loadCase(0);
    state.vera.startTimer();
  }

  function loadCase(idx) {
    state.idx = idx;
    state.highlights = [];
    state.evidence = [];
    state.selectedHighlight = null;
    state.redesign = {};
    state.phase = 'investigate';
    state.showingDebrief = false;

    const c = CASES[idx];
    document.getElementById('g20Counter').textContent = `CASE ${String(idx + 1).padStart(2, '0')} / 15`;
    document.getElementById('g20Scenario').textContent = c.title;
    document.getElementById('g20Target').textContent = `${c.findings.length}`;

    const select = document.getElementById('g20PatternType');
    select.innerHTML = TYPES.map(t => `<option>${t}</option>`).join('');

    renderCanvas();
    renderEvidence();
    renderRedesign();
    updateMetrics();
    state.vera.resetTimer();
  }

  function onDrawStart(e) {
    if (state.phase !== 'investigate') return;
    const rect = document.getElementById('g20Canvas').getBoundingClientRect();
    state.drawStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    state.currentRect = { x: state.drawStart.x, y: state.drawStart.y, w: 0, h: 0 };
    renderCanvas();
  }

  function onDrawMove(e) {
    if (!state.drawStart || state.phase !== 'investigate') return;
    const rect = document.getElementById('g20Canvas').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    state.currentRect = {
      x: Math.min(state.drawStart.x, x),
      y: Math.min(state.drawStart.y, y),
      w: Math.abs(x - state.drawStart.x),
      h: Math.abs(y - state.drawStart.y),
    };
    renderCanvas();
  }

  function onDrawEnd() {
    if (!state.drawStart || !state.currentRect || state.phase !== 'investigate') return;
    if (state.currentRect.w > 16 && state.currentRect.h > 16) {
      state.highlights.push({
        id: `h${state.highlights.length + 1}`,
        rect: state.currentRect,
        type: null,
        note: '',
      });
      state.selectedHighlight = state.highlights[state.highlights.length - 1].id;
    }
    state.drawStart = null;
    state.currentRect = null;
    renderCanvas();
    updateMetrics();
  }

  function renderCanvas() {
    const canvas = document.getElementById('g20Canvas');
    canvas.innerHTML = '<div class="dp-mock"></div>';

    state.highlights.forEach(h => {
      const box = document.createElement('button');
      box.className = 'dp-highlight';
      box.style.left = `${h.rect.x}px`;
      box.style.top = `${h.rect.y}px`;
      box.style.width = `${h.rect.w}px`;
      box.style.height = `${h.rect.h}px`;
      box.textContent = h.type ? h.type.slice(0, 8) : 'mark';
      if (state.selectedHighlight === h.id) box.classList.add('selected');
      box.addEventListener('click', () => {
        state.selectedHighlight = h.id;
        renderCanvas();
      });
      canvas.appendChild(box);
    });

    if (state.currentRect) {
      const box = document.createElement('div');
      box.className = 'dp-highlight temp';
      box.style.left = `${state.currentRect.x}px`;
      box.style.top = `${state.currentRect.y}px`;
      box.style.width = `${state.currentRect.w}px`;
      box.style.height = `${state.currentRect.h}px`;
      canvas.appendChild(box);
    }
  }

  function classifySelected() {
    const h = state.highlights.find(x => x.id === state.selectedHighlight);
    if (!h) {
      state.vera.updateCommentary('Highlight suspicious region first, then classify evidence.');
      return;
    }

    h.type = document.getElementById('g20PatternType').value;
    h.note = document.getElementById('g20EvidenceNote').value.trim();

    state.evidence = state.highlights.filter(x => x.type).map(x => ({
      id: x.id,
      type: x.type,
      note: x.note,
      rect: x.rect,
    }));

    document.getElementById('g20EvidenceNote').value = '';
    renderEvidence();
    updateMetrics();

    if (h.type === 'FORCED CONTINUITY') {
      state.vera.updateCommentary('Pre-ticked consent or hidden renewal can indicate forced continuity.');
    }
  }

  function renderEvidence() {
    const board = document.getElementById('g20EvidenceBoard');
    board.innerHTML = '';

    state.evidence.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'dp-evidence';
      card.innerHTML = `<div class="dp-crop" style="--w:${Math.max(22, ev.rect.w)}px"></div><p>${ev.type}</p><p>${ev.note || 'No note provided'}</p>`;
      board.appendChild(card);
    });
  }

  function toRedesign() {
    state.phase = 'redesign';
    renderRedesign();
  }

  function renderRedesign() {
    const wrap = document.getElementById('g20Redesign');
    if (state.phase !== 'redesign') {
      wrap.innerHTML = '';
      return;
    }

    wrap.innerHTML = '';
    state.evidence.forEach(ev => {
      const row = document.createElement('div');
      row.className = 'dp-redesign-row';
      row.innerHTML = `<p><strong>${ev.type}</strong></p><textarea id="g20Fix_${ev.id}" placeholder="Write ethical redesign for this element...">${state.redesign[ev.id] || ''}</textarea>`;
      row.querySelector('textarea').addEventListener('input', e => {
        state.redesign[ev.id] = e.target.value;
      });
      wrap.appendChild(row);
    });
  }

  function updateMetrics() {
    const c = CASES[state.idx];
    const found = state.evidence.length;
    const density = found / Math.max(1, c.findings.length);

    document.getElementById('g20Found').textContent = `${found}`;
    document.getElementById('g20Density').textContent = `${Math.round(density * 100)}%`;
  }

  function classificationAccuracy() {
    const expected = [...CASES[state.idx].findings];
    let hits = 0;
    state.evidence.forEach(ev => {
      const idx = expected.indexOf(ev.type);
      if (idx >= 0) {
        hits += 1;
        expected.splice(idx, 1);
      }
    });
    return { hits, expectedLeft: expected.length };
  }

  function explanationScore() {
    const keys = ['mislead', 'consent', 'hidden', 'cost', 'cancel', 'warning', 'confuse', 'transparent', 'ethical'];
    let pts = 0;
    state.evidence.forEach(ev => {
      const lower = (ev.note || '').toLowerCase();
      const match = keys.filter(k => lower.includes(k)).length;
      if (match >= 1) pts += 3;
    });
    return pts;
  }

  function redesignScore() {
    return state.evidence.reduce((a, ev) => {
      const text = (state.redesign[ev.id] || '').trim();
      if (!text) return a;
      const quality = Math.min(20, Math.round(text.length / 8));
      return a + quality;
    }, 0);
  }

  function submit() {
    if (state.showingDebrief) return;

    const c = CASES[state.idx];
    const acc = classificationAccuracy();
    const foundPts = acc.hits * 10;
    const classPts = acc.hits * 5;
    const explainPts = explanationScore();
    const redesignPts = redesignScore();
    const nonPatternBonus = c.hasNonPattern && acc.expectedLeft === 0 ? 15 : 0;

    let score = foundPts + classPts + explainPts + redesignPts + nonPatternBonus;
    if (!state.vera.wasHintUsed()) score += 10;
    score = clamp(score, 0, 125);

    state.scores.push(score);
    state.showingDebrief = true;

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g20Score').textContent = String(total);

    document.getElementById('g20DebriefGood').textContent = `Found ${state.evidence.length}/${c.findings.length}. Correctly classified ${acc.hits}.`;
    document.getElementById('g20DebriefMiss').textContent =
      acc.hits < c.findings.length
        ? 'Some dark patterns were missed or misclassified. Re-examine subtle coercion cues.'
        : 'Strong ethical detection and redesign coverage.';

    const overlay = document.getElementById('g20Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('case closed');
  }

  function next() {
    const overlay = document.getElementById('g20Debrief');
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.style.display = 'none'; }, 280);
    state.showingDebrief = false;

    const nextIdx = state.idx + 1;
    if (nextIdx >= CASES.length) {
      showComplete();
      return;
    }
    loadCase(nextIdx);
  }

  function showComplete() {
    const total = state.scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / state.scores.length);
    const xp = avg * 10;

    const saved = JSON.parse(localStorage.getItem('strategy_game_scores') || '{}');
    saved.G20 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('strategy_game_scores', JSON.stringify(saved));

    const progress = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!progress.completedGames) progress.completedGames = [];
    if (!progress.completedGames.includes('G20')) progress.completedGames.push('G20');
    progress.totalXP = (progress.totalXP || 0) + xp;
    if (!progress.skillLevels) progress.skillLevels = {};
    progress.skillLevels.strategy = Math.min(100, (progress.skillLevels.strategy || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(progress));

    document.getElementById('g20FinalScore').textContent = String(avg);
    document.getElementById('g20XP').textContent = `+${xp} XP`;
    document.getElementById('g20PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g20Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));
  }

  function sampleTypes(n) {
    const bag = [...TYPES];
    const out = [];
    while (out.length < n) {
      if (!bag.length) bag.push(...TYPES);
      const i = Math.floor(Math.random() * bag.length);
      out.push(bag.splice(i, 1)[0]);
    }
    return out;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
