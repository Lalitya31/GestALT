(() => {
  'use strict';

  const SLOT_ORDER = ['primary', 'secondary', 'neutral1', 'neutral2', 'neutral3', 'neutral4', 'neutral5', 'success', 'warning', 'error', 'info'];

  const CHALLENGES = [
    { id: 1, brief: 'Trustworthy, Modern, Warm — FinTech — Young Professionals', moodHue: [190, 240], sat: [35, 70] },
    { id: 2, brief: 'Calm, Medical, Reassuring — Health App', moodHue: [150, 220], sat: [20, 55] },
    { id: 3, brief: 'Playful, Creative, Youthful — Social Product', moodHue: [250, 340], sat: [45, 85] },
    { id: 4, brief: 'Premium, Elegant, Minimal — Luxury Commerce', moodHue: [20, 80], sat: [10, 45] },
    { id: 5, brief: 'High Urgency, Critical Alert — Ops Dashboard', moodHue: [0, 40], sat: [40, 90] },
    { id: 6, brief: 'Sustainable, Natural, Grounded — Climate Platform', moodHue: [80, 150], sat: [20, 65] },
    { id: 7, brief: 'Confident, Institutional, Stable — B2B SaaS', moodHue: [190, 250], sat: [20, 55] },
    { id: 8, brief: 'Friendly, Soft, Human — Education Tool', moodHue: [160, 260], sat: [20, 65] },
    { id: 9, brief: 'Data Dense, Focused, Serious — Dev Console', moodHue: [180, 260], sat: [10, 50] },
    { id: 10, brief: 'Emergency Command, Immediate Action — Crisis UI', moodHue: [0, 30], sat: [50, 95] },
  ];

  const state = {
    idx: 0,
    scores: [],
    palette: {},
    vera: null,
    showingDebrief: false,
  };

  function init() {
    const brief = document.getElementById('g14Brief');
    if (!brief) return;

    brief.addEventListener('click', start);
    document.getElementById('g14TheoryToggle').addEventListener('click', () => {
      document.getElementById('g14Theory').classList.toggle('collapsed');
    });

    ['g14Hue', 'g14Sat', 'g14Lig'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        paintControlValues();
        updateWheelPreview();
      });
    });

    document.getElementById('g14ApplyColor').addEventListener('click', applyToSlot);
    document.getElementById('g14Mode').addEventListener('change', renderPreview);
    document.getElementById('g14Submit').addEventListener('click', submit);
    document.getElementById('g14Next').addEventListener('click', next);
    document.getElementById('g14Return').addEventListener('click', () => window.returnToDashboard());

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g14VeraOrb',
      commentId: 'g14VeraComment',
      hintQuestion: 'Are your semantic colors distinct enough from brand and neutral tones?',
      interventionText: 'Set neutrals first for hierarchy, then tune primary/secondary and semantic roles.',
    });
  }

  function start() {
    const brief = document.getElementById('g14Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 350);
    document.getElementById('g14Header').style.display = 'flex';
    document.getElementById('g14Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.idx = idx;
    state.showingDebrief = false;

    const ch = CHALLENGES[idx];
    document.getElementById('g14Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
    document.getElementById('g14BriefText').textContent = `Brief: ${ch.brief}`;

    state.palette = {
      primary: null,
      secondary: null,
      neutral1: hsl(220, 20, 98),
      neutral2: hsl(220, 15, 92),
      neutral3: hsl(220, 12, 75),
      neutral4: hsl(220, 10, 45),
      neutral5: hsl(220, 12, 18),
      success: hsl(145, 55, 45),
      warning: hsl(35, 90, 54),
      error: hsl(3, 75, 52),
      info: hsl(210, 75, 54),
    };

    document.getElementById('g14Hue').value = '220';
    document.getElementById('g14Sat').value = '50';
    document.getElementById('g14Lig').value = '50';
    paintControlValues();
    buildWheel();
    renderSlots();
    renderPreview();
    state.vera.updateCommentary('Build coherent neutrals first, then mood-driven primaries.');
    state.vera.resetTimer();
  }

  function hsl(h, s, l) {
    return `hsl(${h} ${s}% ${l}%)`;
  }

  function paintControlValues() {
    document.getElementById('g14HueVal').textContent = document.getElementById('g14Hue').value;
    document.getElementById('g14SatVal').textContent = `${document.getElementById('g14Sat').value}%`;
    document.getElementById('g14LigVal').textContent = `${document.getElementById('g14Lig').value}%`;
  }

  function currentColor() {
    return hsl(
      Number(document.getElementById('g14Hue').value),
      Number(document.getElementById('g14Sat').value),
      Number(document.getElementById('g14Lig').value)
    );
  }

  function updateWheelPreview() {
    const wheel = document.getElementById('g14Wheel');
    wheel.style.setProperty('--pick-color', currentColor());
  }

  function buildWheel() {
    const wheel = document.getElementById('g14Wheel');
    wheel.innerHTML = '';
    wheel.style.background = 'conic-gradient(from 0deg, #ff4d4d, #ffb84d, #ffee4d, #66ff66, #4dffff, #4d66ff, #c44dff, #ff4dc4, #ff4d4d)';
    updateWheelPreview();
  }

  function applyToSlot() {
    const slot = document.getElementById('g14TargetSlot').value;
    state.palette[slot] = currentColor();
    renderSlots();
    renderPreview();
    state.vera.resetTimer();
  }

  function renderSlots() {
    const slots = document.getElementById('g14Slots');
    slots.innerHTML = '';

    SLOT_ORDER.forEach(k => {
      const chip = document.createElement('button');
      chip.className = 'palette-slot-chip';
      chip.textContent = k.toUpperCase();
      chip.style.background = state.palette[k] || '#1f1f26';
      chip.style.color = '#fff';
      chip.addEventListener('click', () => {
        document.getElementById('g14TargetSlot').value = k;
      });
      slots.appendChild(chip);
    });
  }

  function renderPreview() {
    const mode = document.getElementById('g14Mode').value;
    const bg = mode === 'dark' ? (state.palette.neutral5 || '#111') : (state.palette.neutral1 || '#f7f7f7');
    const text = mode === 'dark' ? (state.palette.neutral1 || '#f3f3f3') : (state.palette.neutral5 || '#121212');
    const primary = state.palette.primary || currentColor();

    const preview = document.getElementById('g14Preview');
    preview.style.background = bg;
    preview.style.color = text;
    preview.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = 'Interface Preview';
    const body = document.createElement('p');
    body.textContent = 'Buttons, status tags, and text should remain readable across states.';
    const btn = document.createElement('button');
    btn.className = 'sim-submit-btn';
    btn.style.background = primary;
    btn.textContent = 'Primary Action';

    const tags = document.createElement('div');
    tags.className = 'palette-tags';
    ['success', 'warning', 'error', 'info'].forEach(tag => {
      const t = document.createElement('span');
      t.className = 'palette-tag';
      t.style.background = state.palette[tag] || '#333';
      t.textContent = tag.toUpperCase();
      tags.appendChild(t);
    });

    preview.appendChild(title);
    preview.appendChild(body);
    preview.appendChild(btn);
    preview.appendChild(tags);

    updateMetrics();
  }

  function extractHsl(color) {
    if (!color || !color.startsWith('hsl(')) return null;
    const cleaned = color.replace('hsl(', '').replace(')', '').replaceAll('%', '');
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length < 3) return null;
    return { h: Number(parts[0]), s: Number(parts[1]), l: Number(parts[2]) };
  }

  function hueDistance(a, b) {
    const d = Math.abs(a - b) % 360;
    return Math.min(d, 360 - d);
  }

  function updateMetrics() {
    const ch = CHALLENGES[state.idx];
    const primary = extractHsl(state.palette.primary);
    const secondary = extractHsl(state.palette.secondary);

    let match = 0;
    if (primary) {
      const hueMid = (ch.moodHue[0] + ch.moodHue[1]) / 2;
      const hueScore = 1 - clamp(hueDistance(primary.h, hueMid) / 120, 0, 1);
      const satScore = inRange(primary.s, ch.sat) ? 1 : 0.4;
      match = (hueScore * 0.7 + satScore * 0.3) * 100;
    }

    const harmony = computeHarmony(primary, secondary);
    document.getElementById('g14Match').textContent = `${Math.round(match)}%`;
    document.getElementById('g14Harmony').textContent = harmony;
  }

  function computeHarmony(primary, secondary) {
    if (!primary || !secondary) return 'INCOMPLETE';
    const d = hueDistance(primary.h, secondary.h);
    if (d > 150 && d < 210) return 'COMPLEMENTARY';
    if (d > 20 && d < 70) return 'ANALOGOUS';
    if (d > 100 && d < 140) return 'TRIADIC';
    return 'CUSTOM';
  }

  function inRange(v, range) {
    return v >= range[0] && v <= range[1];
  }

  function submit() {
    if (state.showingDebrief) return;

    const ch = CHALLENGES[state.idx];
    const primary = extractHsl(state.palette.primary);
    const secondary = extractHsl(state.palette.secondary);

    let score = 0;
    if (primary) {
      const hueMid = (ch.moodHue[0] + ch.moodHue[1]) / 2;
      const mood = clamp(1 - hueDistance(primary.h, hueMid) / 130, 0, 1);
      const sat = inRange(primary.s, ch.sat) ? 1 : 0.4;
      score += (mood * 0.5 + sat * 0.2) * 100;
    }

    if (secondary) score += 20;
    const filled = SLOT_ORDER.filter(k => !!state.palette[k]).length;
    score += (filled / SLOT_ORDER.length) * 25;

    if (!state.vera.wasHintUsed()) score += 10;
    score = clamp(Math.round(score), 0, 125);

    state.scores.push(score);
    state.showingDebrief = true;

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g14Score').textContent = String(total);

    document.getElementById('g14DebriefGood').textContent =
      `Palette slots filled ${filled}/${SLOT_ORDER.length}. Harmony: ${computeHarmony(primary, secondary)}.`;
    document.getElementById('g14DebriefMiss').textContent =
      !primary || !secondary
        ? 'Primary and secondary are required for strong system identity.'
        : 'Tune neutrals and semantic colors to improve practical consistency.';

    const overlay = document.getElementById('g14Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('palette assembled');
  }

  function next() {
    const overlay = document.getElementById('g14Debrief');
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

    const saved = JSON.parse(localStorage.getItem('color_game_scores') || '{}');
    saved.G14 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('color_game_scores', JSON.stringify(saved));

    const progress = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!progress.completedGames) progress.completedGames = [];
    if (!progress.completedGames.includes('G14')) progress.completedGames.push('G14');
    progress.totalXP = (progress.totalXP || 0) + xp;
    if (!progress.skillLevels) progress.skillLevels = {};
    progress.skillLevels.color = Math.min(100, (progress.skillLevels.color || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(progress));

    document.getElementById('g14FinalScore').textContent = String(avg);
    document.getElementById('g14XP').textContent = `+${xp} XP`;
    document.getElementById('g14PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g14Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
