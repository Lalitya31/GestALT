/* G1ProximityField.js — Proximity Law game */
(function () {
  'use strict';

  // ── Challenge definitions ──────────────────────────────────────
  const CHALLENGES = [
    { id: 1, label: 'Triangle',  count: 40, target: 'triangle', timeLimit: 0 },
    { id: 2, label: 'Circle',    count: 40, target: 'circle',   timeLimit: 0 },
    { id: 3, label: 'Square',    count: 40, target: 'square',   timeLimit: 0 },
    { id: 4, label: '"DOT"',     count: 60, target: 'word_DOT', timeLimit: 0 },
    { id: 5, label: '"HI"',      count: 60, target: 'word_HI',  timeLimit: 0 },
    { id: 6, label: '"OK"',      count: 60, target: 'word_OK',  timeLimit: 0 },
    { id: 7, label: 'Star',      count: 70, target: 'star',     timeLimit: 90 },
    { id: 8, label: 'Arrow',     count: 70, target: 'arrow',    timeLimit: 90 },
    { id: 9, label: 'Two Shapes',count: 80, target: 'dual_tri_sq', timeLimit: 60 },
    { id: 10,label: 'Two Words', count: 80, target: 'dual_hi_ok',  timeLimit: 60 },
  ];

  // ── State ──────────────────────────────────────────────────────
  let state = {
    challengeIdx: 0,
    scores: [],
    particles: [],
    gravRadius: 80,
    mouse: { x: -999, y: -999 },
    animFrame: null,
    timerInterval: null,
    timeLeft: 0,
    startTime: 0,
    wrongAttempts: 0,
    vera: null,
    showingDebrief: false,
  };

  // ── DOM refs ───────────────────────────────────────────────────
  let canvas, ctx, targetCanvas, tCtx;

  // ── Init ───────────────────────────────────────────────────────
  function init() {
    canvas       = document.getElementById('g1Canvas');
    ctx          = canvas.getContext('2d');
    targetCanvas = document.getElementById('g1TargetCanvas');
    tCtx         = targetCanvas.getContext('2d');

    // Brief screen
    document.getElementById('g1Brief').addEventListener('click', startGame);

    // Gravity size buttons
    document.querySelectorAll('.grav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.grav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.gravRadius = parseInt(btn.dataset.radius);
      });
    });

    // Theory panel toggle
    document.getElementById('g1TheoryToggle').addEventListener('click', () => {
      document.getElementById('g1Theory').classList.toggle('collapsed');
    });

    // Debrief next
    document.getElementById('g1Next').addEventListener('click', nextChallenge);

    // Return to dashboard
    document.getElementById('g1Return').addEventListener('click', () => window.returnToDashboard());

    // VERA
    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g1VeraOrb',
      commentId: 'g1VeraComment',
      hintQuestion: 'Which elements are closest to each other?',
      interventionText: 'Try moving the gravity well slowly — let elements drift together.',
    });
  }

  function startGame() {
    const brief = document.getElementById('g1Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 400);
    document.getElementById('g1Header').style.display = 'flex';
    document.getElementById('g1Arena').style.display = 'flex';
    resizeCanvas();
    loadChallenge(0);
    state.vera.startTimer();
  }

  function resizeCanvas() {
    const arena = document.getElementById('g1Arena');
    const center = arena.querySelector('.arena-center');
    const w = center.clientWidth - 48;
    const h = center.clientHeight - 120;
    canvas.width  = Math.max(400, w);
    canvas.height = Math.max(300, h);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', () => { state.mouse = { x: -999, y: -999 }; });
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    state.mouse.x = e.clientX - rect.left;
    state.mouse.y = e.clientY - rect.top;
    state.vera.resetTimer();
  }

  // ── Challenge loading ──────────────────────────────────────────
  function loadChallenge(idx) {
    state.challengeIdx = idx;
    const ch = CHALLENGES[idx];
    state.startTime = Date.now();
    state.wrongAttempts = 0;

    document.getElementById('g1Counter').textContent =
      `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;

    // Spawn particles
    state.particles = spawnParticles(ch.count);

    // Draw target
    drawTarget(ch.target);

    // Timer
    clearInterval(state.timerInterval);
    if (ch.timeLimit > 0) {
      state.timeLeft = ch.timeLimit;
      document.getElementById('g1TimerBar').style.display = 'flex';
      document.getElementById('g1Timer').textContent = state.timeLeft;
      state.timerInterval = setInterval(() => {
        state.timeLeft--;
        document.getElementById('g1Timer').textContent = state.timeLeft;
        if (state.timeLeft <= 0) {
          clearInterval(state.timerInterval);
          autoSubmit();
        }
      }, 1000);
    } else {
      document.getElementById('g1TimerBar').style.display = 'none';
    }

    // VERA commentary
    state.vera.updateCommentary('gravity well active — move to group elements');

    // Start loop
    cancelAnimationFrame(state.animFrame);
    loop();
  }

  // ── Particle system ────────────────────────────────────────────
  function spawnParticles(count) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x:  20 + Math.random() * (canvas.width  - 40),
        y:  20 + Math.random() * (canvas.height - 40),
        vx: 0, vy: 0,
        r:  4,
        baseX: 0, baseY: 0,
      });
    }
    // Store base positions
    particles.forEach(p => { p.baseX = p.x; p.baseY = p.y; });
    return particles;
  }

  function loop() {
    update();
    draw();
    state.animFrame = requestAnimationFrame(loop);
  }

  function update() {
    const { mouse, gravRadius, particles } = state;
    particles.forEach(p => {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < gravRadius && dist > 0) {
        const force = (1 - dist / gravRadius) * 0.12;
        p.vx += dx * force;
        p.vy += dy * force;
      }

      // Spring back toward base
      p.vx += (p.baseX - p.x) * 0.004;
      p.vy += (p.baseY - p.y) * 0.004;

      // Damping
      p.vx *= 0.88;
      p.vy *= 0.88;

      p.x += p.vx;
      p.y += p.vy;

      // Clamp
      p.x = Math.max(p.r, Math.min(canvas.width  - p.r, p.x));
      p.y = Math.max(p.r, Math.min(canvas.height - p.r, p.y));
    });

    // Live match score
    const match = calcMatch();
    document.getElementById('g1Match').textContent = match + '%';
    state.vera.updateCommentary(
      match > 60 ? 'strong grouping detected — clusters forming'
      : match > 30 ? 'proximity grouping emerging'
      : 'spread too wide — bring elements closer'
    );

    // Auto-complete when match ≥ 75
    if (match >= 75 && !state.showingDebrief) {
      state.showingDebrief = true;
      clearInterval(state.timerInterval);
      setTimeout(showDebrief, 600);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gravity well
    const { mouse, gravRadius } = state;
    if (mouse.x > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, gravRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(99,102,241,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -performance.now() / 40;
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99,102,241,0.6)';
      ctx.fill();
    }

    // Particles
    state.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = '#E0E0FF';
      ctx.shadowColor = '#6366F1';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  // ── Target shape drawing ───────────────────────────────────────
  function drawTarget(type) {
    tCtx.clearRect(0, 0, 100, 100);
    tCtx.fillStyle = 'rgba(99,102,241,0.15)';
    tCtx.fillRect(0, 0, 100, 100);

    const pts = getTargetPoints(type);
    tCtx.fillStyle = 'rgba(224,224,255,0.5)';
    pts.forEach(([x, y]) => {
      tCtx.beginPath();
      tCtx.arc(x, y, 3, 0, Math.PI * 2);
      tCtx.fill();
    });
  }

  function getTargetPoints(type) {
    const pts = [];
    switch (type) {
      case 'triangle':
        for (let i = 0; i < 15; i++) {
          const t = i / 14;
          pts.push([10 + t * 80, 80 - t * 60]);
          pts.push([50, 10 + (i / 14) * 10]);
        }
        break;
      case 'circle':
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2;
          pts.push([50 + 35 * Math.cos(a), 50 + 35 * Math.sin(a)]);
        }
        break;
      case 'square':
        for (let i = 0; i < 10; i++) {
          const t = i / 9;
          pts.push([15 + t * 70, 15]);
          pts.push([15 + t * 70, 85]);
          pts.push([15, 15 + t * 70]);
          pts.push([85, 15 + t * 70]);
        }
        break;
      case 'word_DOT':
        [[20,30],[20,50],[20,70],[30,20],[30,80],[40,20],[40,80],
         [55,20],[55,50],[55,80],[65,30],[65,70],[75,20],[75,50],[75,80]].forEach(p => pts.push(p));
        break;
      case 'word_HI':
        [[15,20],[15,40],[15,60],[15,80],[25,50],[35,50],[45,20],[45,40],[45,60],[45,80],
         [60,20],[60,40],[60,60],[60,80]].forEach(p => pts.push(p));
        break;
      case 'word_OK':
        [[15,30],[15,50],[15,70],[25,20],[25,80],[35,30],[35,70],
         [50,20],[50,50],[50,80],[60,30],[60,70],[70,20],[70,80]].forEach(p => pts.push(p));
        break;
      case 'star':
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? 40 : 18;
          pts.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
        }
        break;
      case 'arrow':
        [[20,50],[30,50],[40,50],[50,50],[60,50],[70,50],
         [55,35],[55,65],[65,40],[65,60]].forEach(p => pts.push(p));
        break;
      case 'dual_tri_sq':
        for (let i = 0; i < 8; i++) {
          pts.push([10 + i * 5, 80 - i * 8]);
        }
        for (let i = 0; i < 8; i++) {
          const t = i / 7;
          pts.push([60 + t * 30, 20]);
          pts.push([60 + t * 30, 80]);
          pts.push([60, 20 + t * 60]);
          pts.push([90, 20 + t * 60]);
        }
        break;
      case 'dual_hi_ok':
        [[10,20],[10,50],[10,80],[20,50],[30,20],[30,50],[30,80],
         [55,30],[55,70],[65,20],[65,80],[75,30],[75,70],[85,20],[85,80]].forEach(p => pts.push(p));
        break;
      default:
        for (let i = 0; i < 12; i++) {
          pts.push([10 + Math.random() * 80, 10 + Math.random() * 80]);
        }
    }
    return pts;
  }

  // ── Match calculation ──────────────────────────────────────────
  function calcMatch() {
    const ch = CHALLENGES[state.challengeIdx];
    const targetPts = getTargetPoints(ch.target);
    if (!targetPts.length) return 0;

    // Scale target points to canvas
    const scaleX = canvas.width  / 100;
    const scaleY = canvas.height / 100;
    const scaled = targetPts.map(([x, y]) => [x * scaleX, y * scaleY]);

    // For each target point, find nearest particle
    let totalScore = 0;
    const threshold = 60;
    scaled.forEach(([tx, ty]) => {
      let minDist = Infinity;
      state.particles.forEach(p => {
        const d = Math.hypot(p.x - tx, p.y - ty);
        if (d < minDist) minDist = d;
      });
      if (minDist < threshold) {
        totalScore += 1 - minDist / threshold;
      }
    });

    return Math.min(100, Math.round((totalScore / scaled.length) * 100));
  }

  // ── Scoring ────────────────────────────────────────────────────
  function calcChallengeScore(match) {
    const ch = CHALLENGES[state.challengeIdx];
    let score = Math.round(match);
    const elapsed = (Date.now() - state.startTime) / 1000;
    const limit = ch.timeLimit || 120;
    if (elapsed < limit * 0.5) score += 10;
    if (!state.vera.wasHintUsed()) score += 15;
    score -= state.wrongAttempts * 5;
    return Math.max(0, Math.min(125, score));
  }

  function autoSubmit() {
    if (!state.showingDebrief) {
      state.showingDebrief = true;
      showDebrief();
    }
  }

  // ── Debrief ────────────────────────────────────────────────────
  function showDebrief() {
    cancelAnimationFrame(state.animFrame);
    const match = calcMatch();
    const score = calcChallengeScore(match);
    state.scores.push(score);

    // Update running score
    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g1Score').textContent = total;
    document.getElementById('g1ScoreRight').textContent = total;

    const good = match >= 75
      ? `Achieved ${match}% match — proximity grouping successful.`
      : `Reached ${match}% — partial grouping detected.`;
    const miss = match < 75
      ? 'Elements were too spread out. Tighter clusters improve match score.'
      : '';

    document.getElementById('g1DebriefGood').textContent = good;
    document.getElementById('g1DebriefMiss').textContent = miss;

    const overlay = document.getElementById('g1Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));

    state.vera.celebrate('proximity law demonstrated — well done');
  }

  function nextChallenge() {
    const overlay = document.getElementById('g1Debrief');
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.style.display = 'none'; }, 400);

    state.showingDebrief = false;
    state.vera.resetTimer();

    const next = state.challengeIdx + 1;
    if (next >= CHALLENGES.length) {
      showComplete();
    } else {
      loadChallenge(next);
    }
  }

  function showComplete() {
    const total = state.scores.reduce((a, b) => a + b, 0);
    const avg   = Math.round(total / state.scores.length);
    const xp    = avg * 10;

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('gestalt_game_scores') || '{}');
    saved['G01'] = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('gestalt_game_scores', JSON.stringify(saved));

    // Update gestalt_progress
    const prog = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!prog.completedGames) prog.completedGames = [];
    if (!prog.completedGames.includes('G01')) prog.completedGames.push('G01');
    prog.totalXP = (prog.totalXP || 0) + xp;
    if (!prog.skillLevels) prog.skillLevels = {};
    prog.skillLevels.gestalt = Math.min(100, (prog.skillLevels.gestalt || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(prog));

    // Animate score count-up
    const el = document.getElementById('g1FinalScore');
    document.getElementById('g1XP').textContent = `+${xp} XP`;
    document.getElementById('g1PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g1Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));

    let cur = 0;
    const step = Math.ceil(avg / 60);
    const counter = setInterval(() => {
      cur = Math.min(cur + step, avg);
      el.textContent = cur;
      if (cur >= avg) clearInterval(counter);
    }, 16);

    document.getElementById('g1Return').addEventListener('click', () => window.returnToDashboard());
  }

  // ── Boot ───────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);
})();
