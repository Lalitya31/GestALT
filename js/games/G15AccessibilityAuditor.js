(() => {
  'use strict';

  const ISSUE_LIBRARY = [
    { type: 'Insufficient contrast', text: 'Button text contrast is 2.9:1', zone: [80, 80], fix: 'Increase contrast to 4.5:1' },
    { type: 'Missing alt text', text: 'Decorative and informative images have empty alt', zone: [340, 110], fix: 'Add descriptive alt text' },
    { type: 'No label on input', text: 'Search input lacks programmatic label', zone: [120, 220], fix: 'Attach visible label and for/id' },
    { type: 'Broken focus order', text: 'Tab sequence skips modal controls', zone: [400, 230], fix: 'Repair tabindex and DOM order' },
    { type: 'Touch target too small', text: 'Icon buttons are below 44x44', zone: [180, 330], fix: 'Increase hit area to 44x44' },
    { type: 'Missing ARIA role', text: 'Landmark region lacks role', zone: [470, 340], fix: 'Set role and name' },
    { type: 'Seizure risk (animation)', text: 'Blink animation exceeds safe frequency', zone: [270, 380], fix: 'Reduce flashing, add pause' },
    { type: 'Cognitive overload', text: 'Dense status wall with no grouping', zone: [80, 430], fix: 'Chunk content and simplify copy' },
  ];

  const CHALLENGES = Array.from({ length: 15 }).map((_, i) => {
    const issueCount = Math.min(3 + Math.floor(i / 3), 7);
    return {
      id: i + 1,
      name: `Audit batch ${i + 1}`,
      issueCount,
      pass: i < 5 ? 'A' : (i < 10 ? 'AA' : 'AAA'),
    };
  });

  const state = {
    idx: 0,
    scores: [],
    issues: [],
    selectedIssueId: null,
    found: new Set(),
    correct: 0,
    vera: null,
    showingDebrief: false,
  };

  function init() {
    const brief = document.getElementById('g15Brief');
    if (!brief) return;

    brief.addEventListener('click', start);
    document.getElementById('g15TheoryToggle').addEventListener('click', () => {
      document.getElementById('g15Theory').classList.toggle('collapsed');
    });

    ['g15ToolContrast', 'g15ToolScreenReader', 'g15ToolFocus', 'g15ToolTouch', 'g15ToolBlind'].forEach(id => {
      document.getElementById(id).addEventListener('change', renderCanvas);
    });

    document.getElementById('g15Classify').addEventListener('click', classifyAndFix);
    document.getElementById('g15Submit').addEventListener('click', submit);
    document.getElementById('g15Next').addEventListener('click', next);
    document.getElementById('g15Return').addEventListener('click', () => window.returnToDashboard());

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g15VeraOrb',
      commentId: 'g15VeraComment',
      hintQuestion: 'Which issue categories are still unverified by your tool selection?',
      interventionText: 'Switch tools per issue type, then classify with specific fix language.',
    });
  }

  function start() {
    const brief = document.getElementById('g15Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 350);
    document.getElementById('g15Header').style.display = 'flex';
    document.getElementById('g15Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.idx = idx;
    state.issues = [];
    state.selectedIssueId = null;
    state.found = new Set();
    state.correct = 0;
    state.showingDebrief = false;

    const ch = CHALLENGES[idx];
    document.getElementById('g15Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 15`;
    document.getElementById('g15Scenario').textContent = `${ch.name}. Find and fix ${ch.issueCount} hidden accessibility issues.`;
    document.getElementById('g15IssueTarget').textContent = String(ch.issueCount);
    document.getElementById('g15WCAG').textContent = ch.pass;

    state.issues = sampleIssues(ch.issueCount);
    renderCanvas();
    updateMetrics();
    state.vera.resetTimer();
  }

  function sampleIssues(count) {
    const source = [...ISSUE_LIBRARY];
    const chosen = [];
    while (chosen.length < count && source.length) {
      const idx = Math.floor(Math.random() * source.length);
      const pick = source.splice(idx, 1)[0];
      chosen.push({ ...pick, id: `i${chosen.length + 1}` });
    }
    return chosen;
  }

  function activeTools() {
    return {
      contrast: document.getElementById('g15ToolContrast').checked,
      sr: document.getElementById('g15ToolScreenReader').checked,
      focus: document.getElementById('g15ToolFocus').checked,
      touch: document.getElementById('g15ToolTouch').checked,
      blind: document.getElementById('g15ToolBlind').checked,
    };
  }

  function toolSupportsIssue(issueType, tools) {
    if (issueType === 'Insufficient contrast') return tools.contrast || tools.blind;
    if (issueType === 'Missing alt text') return tools.sr;
    if (issueType === 'No label on input') return tools.sr;
    if (issueType === 'Broken focus order') return tools.focus;
    if (issueType === 'Touch target too small') return tools.touch;
    if (issueType === 'Missing ARIA role') return tools.sr;
    if (issueType === 'Seizure risk (animation)') return tools.focus;
    if (issueType === 'Cognitive overload') return tools.sr || tools.focus;
    return false;
  }

  function renderCanvas() {
    const canvas = document.getElementById('g15Canvas');
    canvas.innerHTML = '';
    const tools = activeTools();

    state.issues.forEach(issue => {
      const marker = document.createElement('button');
      marker.className = 'audit-marker';
      marker.style.left = `${issue.zone[0]}px`;
      marker.style.top = `${issue.zone[1]}px`;
      marker.textContent = state.found.has(issue.id) ? 'FIXED' : '?';
      marker.disabled = !toolSupportsIssue(issue.type, tools);

      marker.addEventListener('click', () => {
        state.selectedIssueId = issue.id;
        if (!state.found.has(issue.id)) state.found.add(issue.id);
        updateMetrics();
        renderCanvas();
      });

      canvas.appendChild(marker);

      if (state.selectedIssueId === issue.id) {
        const panel = document.createElement('div');
        panel.className = 'audit-detail';
        panel.style.left = `${Math.min(issue.zone[0] + 30, 400)}px`;
        panel.style.top = `${Math.min(issue.zone[1] + 30, 420)}px`;
        panel.innerHTML = `<p>${issue.text}</p><p><strong>Expected fix:</strong> ${issue.fix}</p>`;
        canvas.appendChild(panel);
      }
    });
  }

  function classifyAndFix() {
    const type = document.getElementById('g15IssueType').value;
    const fix = document.getElementById('g15FixInput').value.trim().toLowerCase();
    const selected = state.issues.find(i => i.id === state.selectedIssueId);
    if (!selected) {
      state.vera.updateCommentary('Select a discovered issue marker before classifying.');
      return;
    }

    const typeCorrect = selected.type === type;
    const fixKeywords = selected.fix.toLowerCase().split(' ').filter(w => w.length > 3);
    const matched = fixKeywords.filter(w => fix.includes(w)).length;
    const fixCorrect = matched >= 2;

    if (typeCorrect && fixCorrect) {
      state.correct += 1;
      state.vera.updateCommentary('Correct classification and actionable fix.');
    } else if (typeCorrect) {
      state.vera.updateCommentary('Type is correct. Improve fix specificity.');
    } else {
      state.vera.updateCommentary('Issue type mismatch. Re-read evidence with tool overlays.');
    }

    document.getElementById('g15FixInput').value = '';
    updateMetrics();
  }

  function updateMetrics() {
    document.getElementById('g15Found').textContent = String(state.found.size);
    document.getElementById('g15Correct').textContent = String(state.correct);
  }

  function submit() {
    if (state.showingDebrief) return;
    const totalIssues = state.issues.length;

    const foundRatio = totalIssues ? state.found.size / totalIssues : 0;
    const correctRatio = totalIssues ? Math.min(1, state.correct / totalIssues) : 0;

    let score = Math.round((foundRatio * 0.45 + correctRatio * 0.55) * 100);
    if (!state.vera.wasHintUsed()) score += 10;
    score = clamp(score, 0, 125);

    state.scores.push(score);
    state.showingDebrief = true;

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g15Score').textContent = String(total);

    document.getElementById('g15DebriefGood').textContent =
      `Found ${state.found.size}/${totalIssues} issues. Correctly classified and fixed: ${state.correct}.`;
    document.getElementById('g15DebriefMiss').textContent =
      state.found.size < totalIssues
        ? 'Some issues remain hidden. Toggle tool overlays per issue category.'
        : (state.correct < totalIssues ? 'All issues found, but some fixes lacked specificity.' : 'Excellent audit quality and coverage.');

    const overlay = document.getElementById('g15Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('audit pass complete');
  }

  function next() {
    const overlay = document.getElementById('g15Debrief');
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
    saved.G15 = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('color_game_scores', JSON.stringify(saved));

    const progress = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!progress.completedGames) progress.completedGames = [];
    if (!progress.completedGames.includes('G15')) progress.completedGames.push('G15');
    progress.totalXP = (progress.totalXP || 0) + xp;
    if (!progress.skillLevels) progress.skillLevels = {};
    progress.skillLevels.color = Math.min(100, (progress.skillLevels.color || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(progress));

    document.getElementById('g15FinalScore').textContent = String(avg);
    document.getElementById('g15XP').textContent = `+${xp} XP`;
    document.getElementById('g15PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g15Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
