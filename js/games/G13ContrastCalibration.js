(() => {
  'use strict';

  const CHALLENGES = [
    { id: 1, goal: 'Readable body over dark UI', targetAA: 4.5, targetAAA: 7 },
    { id: 2, goal: 'Readable body over light UI', targetAA: 4.5, targetAAA: 7 },
    { id: 3, goal: 'CTA text over brand color', targetAA: 4.5, targetAAA: 7 },
    { id: 4, goal: 'Large hero text over image tint', targetAA: 3, targetAAA: 4.5 },
    { id: 5, goal: 'Form labels over panel', targetAA: 4.5, targetAAA: 7 },
    { id: 6, goal: 'Table meta text', targetAA: 4.5, targetAAA: 7 },
    { id: 7, goal: 'Alert banner', targetAA: 4.5, targetAAA: 7 },
    { id: 8, goal: 'Success toast', targetAA: 4.5, targetAAA: 7 },
    { id: 9, goal: 'Dense dashboard row', targetAA: 4.5, targetAAA: 7 },
    { id: 10, goal: 'Emergency command UI', targetAA: 7, targetAAA: 10 },
  ];

  const state = {
    idx: 0,
    scores: [],
    fg: { h: 220, s: 40, l: 92 },
    bg: { h: 220, s: 20, l: 12 },
    locks: { fg: false, bg: false },
    vera: null,
    showingDebrief: false,
  };

  function init() {
    const brief = document.getElementById('g13Brief');
    if (!brief) return;

    brief.addEventListener('click', start);
    document.getElementById('g13TheoryToggle').addEventListener('click', () => {
      document.getElementById('g13Theory').classList.toggle('collapsed');
    });

    bindSlider('g13FgHue', v => state.fg.h = Number(v), 'g13FgHueVal', v => `${v}`);
    bindSlider('g13FgSat', v => state.fg.s = Number(v), 'g13FgSatVal', v => `${v}%`);
    bindSlider('g13FgLig', v => state.fg.l = Number(v), 'g13FgLigVal', v => `${v}%`);
    bindSlider('g13BgHue', v => state.bg.h = Number(v), 'g13BgHueVal', v => `${v}`);
    bindSlider('g13BgSat', v => state.bg.s = Number(v), 'g13BgSatVal', v => `${v}%`);
    bindSlider('g13BgLig', v => state.bg.l = Number(v), 'g13BgLigVal', v => `${v}%`);

    document.getElementById('g13FgLock').addEventListener('change', e => { state.locks.fg = e.target.checked; });
    document.getElementById('g13BgLock').addEventListener('change', e => { state.locks.bg = e.target.checked; });
    document.getElementById('g13Blindness').addEventListener('change', renderPreview);
    document.getElementById('g13BeforeAfter').addEventListener('click', showBeforeAfter);
    document.getElementById('g13Submit').addEventListener('click', submit);
    document.getElementById('g13Next').addEventListener('click', next);
    document.getElementById('g13Return').addEventListener('click', () => window.returnToDashboard());

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g13VeraOrb',
      commentId: 'g13VeraComment',
      hintQuestion: 'Can you increase lightness difference before adjusting hue?',
      interventionText: 'Push foreground and background farther apart in luminance first, then refine saturation.',
    });
  }

  function bindSlider(id, setFn, labelId, formatFn) {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      setFn(el.value);
      document.getElementById(labelId).textContent = formatFn(el.value);
      if (id.startsWith('g13Fg') && state.locks.fg) return;
      if (id.startsWith('g13Bg') && state.locks.bg) return;
      renderPreview();
      state.vera.resetTimer();
    });
  }

  function start() {
    const brief = document.getElementById('g13Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 350);
    document.getElementById('g13Header').style.display = 'flex';
    document.getElementById('g13Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.idx = idx;
    state.showingDebrief = false;

    const ch = CHALLENGES[idx];
    document.getElementById('g13Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;

    if (idx % 2 === 0) {
      state.fg = { h: 220, s: 35, l: 85 };
      state.bg = { h: 220, s: 25, l: 14 };
    } else {
      state.fg = { h: 220, s: 20, l: 18 };
      state.bg = { h: 220, s: 25, l: 92 };
    }

    syncControls();
    renderPreview();
    state.vera.updateCommentary(`${ch.goal}. Target AA ${ch.targetAA}:1.`);
    state.vera.resetTimer();
  }

  function syncControls() {
    setControl('g13FgHue', state.fg.h, 'g13FgHueVal', `${state.fg.h}`);
    setControl('g13FgSat', state.fg.s, 'g13FgSatVal', `${state.fg.s}%`);
    setControl('g13FgLig', state.fg.l, 'g13FgLigVal', `${state.fg.l}%`);
    setControl('g13BgHue', state.bg.h, 'g13BgHueVal', `${state.bg.h}`);
    setControl('g13BgSat', state.bg.s, 'g13BgSatVal', `${state.bg.s}%`);
    setControl('g13BgLig', state.bg.l, 'g13BgLigVal', `${state.bg.l}%`);
  }

  function setControl(id, value, labelId, labelValue) {
    document.getElementById(id).value = String(value);
    document.getElementById(labelId).textContent = labelValue;
  }

  function renderPreview() {
    const fg = hslToRgb(state.fg.h, state.fg.s, state.fg.l);
    const bg = hslToRgb(state.bg.h, state.bg.s, state.bg.l);
    const mode = document.getElementById('g13Blindness').value;

    const sfg = applyVisionMode(fg, mode);
    const sbg = applyVisionMode(bg, mode);

    const preview = document.getElementById('g13Preview');
    preview.style.color = rgbToCss(sfg);
    preview.style.background = rgbToCss(sbg);

    const ratio = contrastRatio(sfg, sbg);
    const aaNormal = ratio >= 4.5;
    const aaaNormal = ratio >= 7;
    const aaLarge = ratio >= 3;

    document.getElementById('g13Ratio').textContent = `${ratio.toFixed(2)}:1`;
    document.getElementById('g13Badges').textContent =
      `${aaNormal ? 'AA normal' : 'AA normal fail'} | ${aaaNormal ? 'AAA normal' : 'AAA normal fail'} | ${aaLarge ? 'AA large' : 'AA large fail'}`;

    if (ratio >= 7) state.vera.updateCommentary('excellent contrast envelope');
    else if (ratio >= 4.5) state.vera.updateCommentary('AA pass, push luminance for AAA');
    else state.vera.updateCommentary('contrast below readable threshold');
  }

  function showBeforeAfter() {
    const preview = document.getElementById('g13Preview');
    const oldBg = preview.style.background;
    const oldFg = preview.style.color;

    preview.style.background = '#111111';
    preview.style.color = '#4a4a4a';
    setTimeout(() => {
      preview.style.background = oldBg;
      preview.style.color = oldFg;
    }, 650);
  }

  function submit() {
    if (state.showingDebrief) return;

    const ch = CHALLENGES[state.idx];
    const ratio = contrastRatio(
      applyVisionMode(hslToRgb(state.fg.h, state.fg.s, state.fg.l), document.getElementById('g13Blindness').value),
      applyVisionMode(hslToRgb(state.bg.h, state.bg.s, state.bg.l), document.getElementById('g13Blindness').value)
    );

    const quality = clamp((ratio - 1) / Math.max(1, ch.targetAAA - 1), 0, 1);
    let score = Math.round(quality * 100);
    if (!state.vera.wasHintUsed()) score += 10;
    score = clamp(score, 0, 125);

    state.scores.push(score);
    state.showingDebrief = true;

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g13Score').textContent = String(total);

    document.getElementById('g13DebriefGood').textContent =
      `Contrast ratio ${ratio.toFixed(2)}:1. Target for this challenge is ${ch.targetAA}:1 or higher.`;
    document.getElementById('g13DebriefMiss').textContent =
      ratio < ch.targetAA
        ? 'Fails target. Increase lightness separation first, then tune hue/saturation.'
        : (ratio < ch.targetAAA ? 'Passes AA. Push further for AAA-quality legibility.' : 'Excellent calibration and robust readability.');

    const overlay = document.getElementById('g13Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('contrast calibrated');
  }

  function next() {
    const overlay = document.getElementById('g13Debrief');
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
    saved.G13 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('typography_game_scores', JSON.stringify(saved));

    const progress = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!progress.completedGames) progress.completedGames = [];
    if (!progress.completedGames.includes('G13')) progress.completedGames.push('G13');
    progress.totalXP = (progress.totalXP || 0) + xp;
    if (!progress.skillLevels) progress.skillLevels = {};
    progress.skillLevels.typography = Math.min(100, (progress.skillLevels.typography || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(progress));

    document.getElementById('g13FinalScore').textContent = String(avg);
    document.getElementById('g13XP').textContent = `+${xp} XP`;
    document.getElementById('g13PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g13Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));
  }

  function hslToRgb(h, s, l) {
    const hh = ((h % 360) + 360) % 360;
    const ss = clamp(s / 100, 0, 1);
    const ll = clamp(l / 100, 0, 1);

    const c = (1 - Math.abs(2 * ll - 1)) * ss;
    const x = c * (1 - Math.abs((hh / 60) % 2 - 1));
    const m = ll - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (hh < 60) [r, g, b] = [c, x, 0];
    else if (hh < 120) [r, g, b] = [x, c, 0];
    else if (hh < 180) [r, g, b] = [0, c, x];
    else if (hh < 240) [r, g, b] = [0, x, c];
    else if (hh < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  function rgbToCss(rgb) {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  function srgbToLinear(v) {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }

  function luminance(c) {
    return 0.2126 * srgbToLinear(c.r) + 0.7152 * srgbToLinear(c.g) + 0.0722 * srgbToLinear(c.b);
  }

  function contrastRatio(a, b) {
    const l1 = luminance(a);
    const l2 = luminance(b);
    const max = Math.max(l1, l2);
    const min = Math.min(l1, l2);
    return (max + 0.05) / (min + 0.05);
  }

  function applyVisionMode(rgb, mode) {
    const m = {
      none: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
      deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
      tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
    }[mode] || [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

    const r = clamp(Math.round(rgb.r * m[0][0] + rgb.g * m[0][1] + rgb.b * m[0][2]), 0, 255);
    const g = clamp(Math.round(rgb.r * m[1][0] + rgb.g * m[1][1] + rgb.b * m[1][2]), 0, 255);
    const b = clamp(Math.round(rgb.r * m[2][0] + rgb.g * m[2][1] + rgb.b * m[2][2]), 0, 255);
    return { r, g, b };
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
