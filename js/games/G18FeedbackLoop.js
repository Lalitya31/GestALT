(() => {
  'use strict';

  const WHAT_OPTIONS = [
    'Visual change', 'Sound cue', 'Haptic', 'Text message', 'Loading indicator', 'Success state', 'Error state', 'Progress update',
  ];

  const CHALLENGES = [
    { id: 1, name: '3-step form I', actions: ['Click Submit', 'Wait', 'Confirm'] },
    { id: 2, name: '3-step form II', actions: ['Type Email', 'Click Submit', 'Wait', 'Confirm'] },
    { id: 3, name: 'File upload I', actions: ['Select file', 'Upload', 'Wait', 'Complete'] },
    { id: 4, name: 'File upload II', actions: ['Select files', 'Upload', 'Progress', 'Complete'] },
    { id: 5, name: 'Checkout feedback I', actions: ['Review cart', 'Pay now', 'Processing', 'Receipt'] },
    { id: 6, name: 'Checkout feedback II', actions: ['Address', 'Payment', 'Processing', 'Receipt'] },
    { id: 7, name: 'Collaboration I', actions: ['Edit doc', 'Remote edit', 'Conflict', 'Resolved'] },
    { id: 8, name: 'Collaboration II', actions: ['Comment', 'Sync', 'Presence update', 'Saved'] },
    { id: 9, name: 'Destructive action', actions: ['Open settings', 'Delete account', 'Confirm', 'Complete'] },
    { id: 10, name: 'Error recovery flow', actions: ['Trigger error', 'Diagnose', 'Recover', 'Confirmed'] },
  ];

  const state = {
    idx: 0,
    scores: [],
    slots: [],
    selectedSlot: -1,
    virtualConfusion: 0,
    vera: null,
    showingDebrief: false,
  };

  function init() {
    const brief = document.getElementById('g18Brief');
    if (!brief) return;

    brief.addEventListener('click', start);
    document.getElementById('g18TheoryToggle').addEventListener('click', () => {
      document.getElementById('g18Theory').classList.toggle('collapsed');
    });

    document.getElementById('g18What').addEventListener('change', saveSlotEdit);
    document.getElementById('g18Where').addEventListener('change', saveSlotEdit);
    document.getElementById('g18When').addEventListener('change', saveSlotEdit);
    document.getElementById('g18Long').addEventListener('change', saveSlotEdit);

    document.getElementById('g18Simulate').addEventListener('click', simulateVirtualUser);
    document.getElementById('g18Submit').addEventListener('click', submit);
    document.getElementById('g18Next').addEventListener('click', next);
    document.getElementById('g18Return').addEventListener('click', () => window.returnToDashboard());

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g18VeraOrb',
      commentId: 'g18VeraComment',
      hintQuestion: 'What is the worst case the user imagines during silence?',
      interventionText: 'Insert feedback at uncertainty points, not after certainty is obvious.',
    });
  }

  function start() {
    const brief = document.getElementById('g18Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 320);
    document.getElementById('g18Header').style.display = 'flex';
    document.getElementById('g18Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.idx = idx;
    state.selectedSlot = -1;
    state.showingDebrief = false;
    state.virtualConfusion = 70;

    const ch = CHALLENGES[idx];
    state.slots = Array.from({ length: Math.max(0, ch.actions.length - 1) }).map(() => ({
      what: 'Visual change',
      where: 'Inline on element',
      when: 'Immediate (0ms)',
      long: 'Brief (1s)',
      filled: false,
    }));

    document.getElementById('g18Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
    document.getElementById('g18Scenario').textContent = ch.name;

    renderTimeline();
    updateDensity();
    updateVirtualMeter();
    state.vera.resetTimer();
  }

  function renderTimeline() {
    const track = document.getElementById('g18FlowTrack');
    track.innerHTML = '';
    const actions = CHALLENGES[state.idx].actions;

    actions.forEach((action, i) => {
      const node = document.createElement('div');
      node.className = 'fb-node';
      node.textContent = action;
      track.appendChild(node);

      if (i < actions.length - 1) {
        const slotBtn = document.createElement('button');
        slotBtn.className = 'fb-slot';
        slotBtn.dataset.idx = String(i);
        slotBtn.textContent = state.slots[i].filled ? `✓ ${state.slots[i].what}` : '+';
        if (state.selectedSlot === i) slotBtn.classList.add('selected');
        slotBtn.addEventListener('click', () => selectSlot(i));
        track.appendChild(slotBtn);
      }
    });
  }

  function selectSlot(idx) {
    state.selectedSlot = idx;
    const slot = state.slots[idx];
    document.getElementById('g18What').value = slot.what;
    document.getElementById('g18Where').value = slot.where;
    document.getElementById('g18When').value = slot.when;
    document.getElementById('g18Long').value = slot.long;
    renderTimeline();
  }

  function saveSlotEdit() {
    if (state.selectedSlot < 0) return;
    const slot = state.slots[state.selectedSlot];
    slot.what = document.getElementById('g18What').value;
    slot.where = document.getElementById('g18Where').value;
    slot.when = document.getElementById('g18When').value;
    slot.long = document.getElementById('g18Long').value;
    slot.filled = true;

    renderTimeline();
    updateDensity();
    state.vera.resetTimer();
  }

  function slotQuality(slot) {
    let q = 0;
    if (slot.when.includes('Immediate') && (slot.what === 'Loading indicator' || slot.what === 'Visual change')) q += 30;
    if (slot.what === 'Progress update' && slot.where === 'Inline on element') q += 25;
    if (slot.what === 'Error state' && slot.long !== 'Brief (1s)') q += 20;
    if (slot.where === 'Toast notification' && slot.long === 'Persistent (until dismissed)') q -= 10;
    if (slot.what === 'Sound cue' && slot.where === 'Modal') q -= 6;
    return clamp(q + 35, 0, 100);
  }

  function updateDensity() {
    const total = state.slots.length;
    const filled = state.slots.filter(s => s.filled).length;
    const density = total ? filled / total : 0;

    const meter = document.getElementById('g18Density');
    meter.textContent = `${Math.round(density * 100)}%`;

    if (density < 0.45) {
      meter.style.color = '#F59E0B';
      state.vera.updateCommentary('Feedback is sparse. Users may interpret silence as failure.');
    } else if (density <= 0.8) {
      meter.style.color = '#4ADE80';
      state.vera.updateCommentary('Feedback density is balanced and interpretable.');
    } else {
      meter.style.color = '#EF4444';
      state.vera.updateCommentary('Too many concurrent signals: this is noise, not clarity.');
    }
  }

  function simulateVirtualUser() {
    const filledSlots = state.slots.filter(s => s.filled);
    if (!filledSlots.length) {
      state.virtualConfusion = 85;
      updateVirtualMeter();
      return;
    }

    const avgQ = filledSlots.reduce((a, s) => a + slotQuality(s), 0) / filledSlots.length;
    const density = filledSlots.length / Math.max(1, state.slots.length);

    let confusion = 100 - avgQ;
    if (density > 0.85) confusion += 18;
    if (density < 0.4) confusion += 12;
    state.virtualConfusion = clamp(Math.round(confusion), 5, 98);
    updateVirtualMeter();
  }

  function updateVirtualMeter() {
    const meter = document.getElementById('g18Confusion');
    meter.textContent = `${state.virtualConfusion}%`;
    meter.style.color = state.virtualConfusion > 65 ? '#EF4444' : (state.virtualConfusion > 35 ? '#F59E0B' : '#4ADE80');
  }

  function submit() {
    if (state.showingDebrief) return;

    simulateVirtualUser();

    const filled = state.slots.filter(s => s.filled);
    const filledRatio = filled.length / Math.max(1, state.slots.length);
    const quality = filled.length ? filled.reduce((a, s) => a + slotQuality(s), 0) / filled.length : 0;

    let score = Math.round((filledRatio * 0.35 + (quality / 100) * 0.65) * 100);
    if (state.virtualConfusion < 35) score += 10;
    if (!state.vera.wasHintUsed()) score += 10;
    score = clamp(score, 0, 125);

    state.scores.push(score);
    state.showingDebrief = true;

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g18Score').textContent = String(total);

    document.getElementById('g18DebriefGood').textContent = `Virtual confusion ${state.virtualConfusion}%. Feedback quality ${Math.round(quality)}.`;
    document.getElementById('g18DebriefMiss').textContent =
      state.virtualConfusion > 60
        ? 'There are still silent gaps. Insert immediate status feedback near user actions.'
        : 'Feedback is timely and proportionate across the flow.';

    const overlay = document.getElementById('g18Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('feedback loop stabilized');
  }

  function next() {
    const overlay = document.getElementById('g18Debrief');
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
    saved.G18 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('interaction_game_scores', JSON.stringify(saved));

    const progress = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!progress.completedGames) progress.completedGames = [];
    if (!progress.completedGames.includes('G18')) progress.completedGames.push('G18');
    progress.totalXP = (progress.totalXP || 0) + xp;
    if (!progress.skillLevels) progress.skillLevels = {};
    progress.skillLevels.interaction = Math.min(100, (progress.skillLevels.interaction || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(progress));

    document.getElementById('g18FinalScore').textContent = String(avg);
    document.getElementById('g18XP').textContent = `+${xp} XP`;
    document.getElementById('g18PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g18Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
