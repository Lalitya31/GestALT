/* G6LoadReducer.js — Cognitive Load game */
(function () {
  'use strict';

  // Element cost table
  const COSTS = {
    primary:   5,
    secondary: 8,
    decoration:12,
    tooltip:   6,
    animation: 15,
    nav:       7,
    label:     4,
    input:     5,
  };

  // ── Challenge definitions ──────────────────────────────────────
  const CHALLENGES = [
    {
      id:1, label:'Overloaded Sign-Up Form', budget:40,
      sections:[
        { label:'FORM ELEMENTS', items:[
          { id:'e1',  text:'Name',           type:'input',     cost:COSTS.input,     essential:true  },
          { id:'e2',  text:'Email',           type:'input',     cost:COSTS.input,     essential:true  },
          { id:'e3',  text:'Phone',           type:'input',     cost:COSTS.input,     essential:false },
          { id:'e4',  text:'Date of Birth',   type:'input',     cost:COSTS.input,     essential:false },
          { id:'e5',  text:'Sign Up',         type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'e6',  text:'Cancel',          type:'secondary', cost:COSTS.secondary, essential:false },
          { id:'e7',  text:'Reset Form',      type:'secondary', cost:COSTS.secondary, essential:false },
        ]},
        { label:'DECORATIONS', items:[
          { id:'e8',  text:'Hero Banner',     type:'decoration',cost:COSTS.decoration,essential:false },
          { id:'e9',  text:'Promo Animation', type:'animation', cost:COSTS.animation, essential:false },
          { id:'e10', text:'Social Proof',    type:'decoration',cost:COSTS.decoration,essential:false },
        ]},
      ],
    },
    {
      id:2, label:'Cluttered Login Page', budget:40,
      sections:[
        { label:'LOGIN ELEMENTS', items:[
          { id:'f1', text:'Email Input',      type:'input',     cost:COSTS.input,     essential:true  },
          { id:'f2', text:'Password Input',   type:'input',     cost:COSTS.input,     essential:true  },
          { id:'f3', text:'Log In',           type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'f4', text:'Forgot Password',  type:'tooltip',   cost:COSTS.tooltip,   essential:true  },
          { id:'f5', text:'Remember Me',      type:'secondary', cost:COSTS.secondary, essential:false },
          { id:'f6', text:'Sign Up Instead',  type:'secondary', cost:COSTS.secondary, essential:false },
        ]},
        { label:'EXTRAS', items:[
          { id:'f7', text:'Background Video', type:'animation', cost:COSTS.animation, essential:false },
          { id:'f8', text:'Cookie Banner',    type:'decoration',cost:COSTS.decoration,essential:false },
          { id:'f9', text:'Newsletter Popup', type:'animation', cost:COSTS.animation, essential:false },
        ]},
      ],
    },
    {
      id:3, label:'Bloated Navigation', budget:35,
      sections:[
        { label:'NAV ITEMS', items:[
          { id:'n1', text:'Home',         type:'nav', cost:COSTS.nav, essential:true  },
          { id:'n2', text:'Products',     type:'nav', cost:COSTS.nav, essential:true  },
          { id:'n3', text:'Services',     type:'nav', cost:COSTS.nav, essential:true  },
          { id:'n4', text:'About',        type:'nav', cost:COSTS.nav, essential:false },
          { id:'n5', text:'Blog',         type:'nav', cost:COSTS.nav, essential:false },
          { id:'n6', text:'Careers',      type:'nav', cost:COSTS.nav, essential:false },
          { id:'n7', text:'Press',        type:'nav', cost:COSTS.nav, essential:false },
          { id:'n8', text:'Partners',     type:'nav', cost:COSTS.nav, essential:false },
          { id:'n9', text:'Contact',      type:'nav', cost:COSTS.nav, essential:true  },
        ]},
        { label:'NAV EXTRAS', items:[
          { id:'n10',text:'Mega Menu Anim',type:'animation',cost:COSTS.animation,essential:false },
          { id:'n11',text:'Promo Banner',  type:'decoration',cost:COSTS.decoration,essential:false },
        ]},
      ],
    },
    {
      id:4, label:'Overloaded App Nav', budget:35,
      sections:[
        { label:'APP NAVIGATION', items:[
          { id:'a1', text:'Dashboard',    type:'nav', cost:COSTS.nav, essential:true  },
          { id:'a2', text:'Analytics',    type:'nav', cost:COSTS.nav, essential:true  },
          { id:'a3', text:'Users',        type:'nav', cost:COSTS.nav, essential:true  },
          { id:'a4', text:'Reports',      type:'nav', cost:COSTS.nav, essential:false },
          { id:'a5', text:'Exports',      type:'nav', cost:COSTS.nav, essential:false },
          { id:'a6', text:'Integrations', type:'nav', cost:COSTS.nav, essential:false },
          { id:'a7', text:'Billing',      type:'nav', cost:COSTS.nav, essential:false },
          { id:'a8', text:'Settings',     type:'nav', cost:COSTS.nav, essential:true  },
        ]},
        { label:'WIDGETS', items:[
          { id:'a9', text:'Live Chat Bubble',type:'animation',cost:COSTS.animation,essential:false },
          { id:'a10',text:'Notification Pulse',type:'animation',cost:COSTS.animation,essential:false },
        ]},
      ],
    },
    {
      id:5, label:'Dashboard Widget Overload', budget:30,
      sections:[
        { label:'WIDGETS', items:[
          { id:'w1', text:'Revenue Chart',   type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'w2', text:'User Count',      type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'w3', text:'Conversion Rate', type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'w4', text:'Bounce Rate',     type:'secondary', cost:COSTS.secondary, essential:false },
          { id:'w5', text:'Session Duration',type:'secondary', cost:COSTS.secondary, essential:false },
          { id:'w6', text:'Page Views',      type:'secondary', cost:COSTS.secondary, essential:false },
          { id:'w7', text:'Heatmap Preview', type:'decoration',cost:COSTS.decoration,essential:false },
          { id:'w8', text:'Live Feed Anim',  type:'animation', cost:COSTS.animation, essential:false },
        ]},
      ],
    },
    {
      id:6, label:'Excessive Dashboard II', budget:30,
      sections:[
        { label:'PANELS', items:[
          { id:'p1', text:'KPI Summary',     type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'p2', text:'Recent Activity', type:'secondary', cost:COSTS.secondary, essential:true  },
          { id:'p3', text:'Team Members',    type:'secondary', cost:COSTS.secondary, essential:false },
          { id:'p4', text:'Weather Widget',  type:'decoration',cost:COSTS.decoration,essential:false },
          { id:'p5', text:'Stock Ticker',    type:'animation', cost:COSTS.animation, essential:false },
          { id:'p6', text:'Social Feed',     type:'animation', cost:COSTS.animation, essential:false },
          { id:'p7', text:'Motivational Quote',type:'decoration',cost:COSTS.decoration,essential:false },
        ]},
      ],
    },
    {
      id:7, label:'Checkout Friction', budget:25,
      sections:[
        { label:'CHECKOUT STEPS', items:[
          { id:'c1', text:'Cart Summary',    type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'c2', text:'Pay Now',         type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'c3', text:'Promo Code',      type:'input',     cost:COSTS.input,     essential:false },
          { id:'c4', text:'Gift Wrap Option',type:'secondary', cost:COSTS.secondary, essential:false },
          { id:'c5', text:'Newsletter Opt-in',type:'secondary',cost:COSTS.secondary, essential:false },
          { id:'c6', text:'Upsell Banner',   type:'animation', cost:COSTS.animation, essential:false },
          { id:'c7', text:'Trust Badges',    type:'decoration',cost:COSTS.decoration,essential:false },
        ]},
      ],
    },
    {
      id:8, label:'Checkout Friction II', budget:25,
      sections:[
        { label:'PAYMENT SCREEN', items:[
          { id:'q1', text:'Card Number',     type:'input',     cost:COSTS.input,     essential:true  },
          { id:'q2', text:'Expiry',          type:'input',     cost:COSTS.input,     essential:true  },
          { id:'q3', text:'CVV',             type:'input',     cost:COSTS.input,     essential:true  },
          { id:'q4', text:'Confirm Payment', type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'q5', text:'Save Card',       type:'secondary', cost:COSTS.secondary, essential:false },
          { id:'q6', text:'Security Anim',   type:'animation', cost:COSTS.animation, essential:false },
          { id:'q7', text:'Partner Logos',   type:'decoration',cost:COSTS.decoration,essential:false },
          { id:'q8', text:'Live Chat',       type:'animation', cost:COSTS.animation, essential:false },
        ]},
      ],
    },
    {
      id:9, label:'Mobile UI — Extreme Minimalism', budget:20,
      sections:[
        { label:'MOBILE ELEMENTS', items:[
          { id:'m1', text:'Search',          type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'m2', text:'Primary Action',  type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'m3', text:'Back Button',     type:'nav',       cost:COSTS.nav,       essential:true  },
          { id:'m4', text:'Share Button',    type:'secondary', cost:COSTS.secondary, essential:false },
          { id:'m5', text:'Bookmark',        type:'secondary', cost:COSTS.secondary, essential:false },
          { id:'m6', text:'Rating Widget',   type:'decoration',cost:COSTS.decoration,essential:false },
          { id:'m7', text:'Floating Anim',   type:'animation', cost:COSTS.animation, essential:false },
        ]},
      ],
    },
    {
      id:10, label:'Mobile UI — Ultra Minimal', budget:20,
      sections:[
        { label:'MOBILE SCREEN', items:[
          { id:'z1', text:'Content',         type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'z2', text:'CTA Button',      type:'primary',   cost:COSTS.primary,   essential:true  },
          { id:'z3', text:'Menu Icon',       type:'nav',       cost:COSTS.nav,       essential:true  },
          { id:'z4', text:'Notification Dot',type:'animation', cost:COSTS.animation, essential:false },
          { id:'z5', text:'Ad Banner',       type:'animation', cost:COSTS.animation, essential:false },
          { id:'z6', text:'Social Buttons',  type:'secondary', cost:COSTS.secondary, essential:false },
          { id:'z7', text:'Cookie Notice',   type:'decoration',cost:COSTS.decoration,essential:false },
        ]},
      ],
    },
  ];

  // ── State ──────────────────────────────────────────────────────
  let state = {
    challengeIdx: 0,
    scores: [],
    removed: new Set(),
    hidden: new Set(),
    relabeled: new Set(),
    renamedText: {},
    combinedInto: {},
    combinedBonus: {},
    draggingId: null,
    vera: null,
    showingDebrief: false,
    startTime: 0,
  };

  function init() {
    document.getElementById('g6Brief').addEventListener('click', startGame);
    document.getElementById('g6TheoryToggle').addEventListener('click', () =>
      document.getElementById('g6Theory').classList.toggle('collapsed'));
    document.getElementById('g6Next').addEventListener('click', nextChallenge);
    document.getElementById('g6Return').addEventListener('click', () => window.returnToDashboard());
    document.getElementById('g6FuncCheck').addEventListener('click', funcCheck);

    state.vera = new VERASystem();
    state.vera.init({
      orbId: 'g6VeraOrb',
      commentId: 'g6VeraComment',
      hintQuestion: 'Which of these would a user need in the first 10 seconds?',
      interventionText: 'Remove animations first — each costs 15 points and rarely adds value.',
    });
  }

  function startGame() {
    const brief = document.getElementById('g6Brief');
    brief.classList.add('dismissed');
    setTimeout(() => { brief.style.display = 'none'; }, 400);
    document.getElementById('g6Header').style.display = 'flex';
    document.getElementById('g6Arena').style.display = 'flex';
    loadChallenge(0);
    state.vera.startTimer();
  }

  function loadChallenge(idx) {
    state.challengeIdx = idx;
    state.removed = new Set();
    state.hidden = new Set();
    state.relabeled = new Set();
    state.renamedText = {};
    state.combinedInto = {};
    state.combinedBonus = {};
    state.draggingId = null;
    state.showingDebrief = false;
    state.startTime = Date.now();
    const ch = CHALLENGES[idx];

    document.getElementById('g6Counter').textContent =
      `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
    document.getElementById('g6BudgetTarget').textContent = `TARGET: ${ch.budget}`;

    renderCanvas(ch);
    updateBudget(ch);
    state.vera.updateCommentary(`budget: ${calcBudget(ch)} — target: ${ch.budget}`);
  }

  function renderCanvas(ch) {
    const canvas = document.getElementById('g6Canvas');
    canvas.innerHTML = ch.sections.map(sec => `
      <div class="load-section">
        <span class="load-section-label">${sec.label}</span>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${sec.items.map(item => `
            <div class="load-el ${state.removed.has(item.id) ? 'removed' : ''}" id="el_${item.id}" data-id="${item.id}" data-cost="${effectiveCost(item)}" draggable="${state.removed.has(item.id) ? 'false' : 'true'}" title="Drag onto another element to combine">
              <span>${state.renamedText[item.id] || item.text}</span>
              <span class="cost-badge">${effectiveCost(item)}pt</span>
              <span class="remove-x" data-id="${item.id}" title="Remove">×</span>
              <span class="remove-x" data-hide-id="${item.id}" title="Hide">_</span>
              <span class="remove-x" data-rename-id="${item.id}" title="Relabel">Aa</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    canvas.querySelectorAll('.remove-x[data-id]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        removeElement(btn.dataset.id, ch);
      });
    });

    canvas.querySelectorAll('.remove-x[data-hide-id]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        hideElement(btn.dataset.hideId, ch);
      });
    });

    canvas.querySelectorAll('.remove-x[data-rename-id]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        relabelElement(btn.dataset.renameId, ch);
      });
    });

    canvas.querySelectorAll('.load-el').forEach(el => {
      el.addEventListener('dragstart', e => {
        const id = el.dataset.id;
        if (state.removed.has(id)) return;
        state.draggingId = id;
        e.dataTransfer.setData('text/plain', id);
      });
      el.addEventListener('dragover', e => {
        e.preventDefault();
      });
      el.addEventListener('drop', e => {
        e.preventDefault();
        const sourceId = e.dataTransfer.getData('text/plain');
        const targetId = el.dataset.id;
        combineElements(sourceId, targetId, ch);
      });
    });
  }

  function findItem(ch, id) {
    for (const sec of ch.sections) {
      for (const item of sec.items) {
        if (item.id === id) return item;
      }
    }
    return null;
  }

  function effectiveCost(item) {
    if (state.removed.has(item.id) && !state.combinedInto[item.id]) return 0;

    let cost = item.cost;
    cost += state.combinedBonus[item.id] || 0;
    if (state.hidden.has(item.id)) cost = Math.round(cost * 0.45);
    if (state.relabeled.has(item.id)) cost = Math.max(1, cost - 2);
    return cost;
  }

  function removeElement(id, ch) {
    if (state.removed.has(id)) return;
    state.removed.add(id);
    renderCanvas(ch);
    updateBudget(ch);
    state.vera.resetTimer();
  }

  function hideElement(id, ch) {
    if (state.removed.has(id)) return;
    if (state.hidden.has(id)) state.hidden.delete(id);
    else state.hidden.add(id);
    renderCanvas(ch);
    updateBudget(ch);
    state.vera.resetTimer();
  }

  function relabelElement(id, ch) {
    if (state.removed.has(id)) return;
    const item = findItem(ch, id);
    if (!item) return;
    const next = window.prompt('Relabel for clarity:', state.renamedText[id] || item.text);
    if (!next || !next.trim()) return;
    state.renamedText[id] = next.trim();
    state.relabeled.add(id);
    renderCanvas(ch);
    updateBudget(ch);
    state.vera.resetTimer();
  }

  function combineElements(sourceId, targetId, ch) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    if (state.removed.has(sourceId) || state.removed.has(targetId)) return;

    const source = findItem(ch, sourceId);
    const target = findItem(ch, targetId);
    if (!source || !target) return;

    state.removed.add(sourceId);
    state.combinedInto[sourceId] = targetId;
    state.combinedBonus[targetId] = (state.combinedBonus[targetId] || 0) + Math.round(source.cost * 0.4);

    const mergedLabel = `${state.renamedText[targetId] || target.text} + ${state.renamedText[sourceId] || source.text}`;
    state.renamedText[targetId] = mergedLabel;
    state.relabeled.add(targetId);

    renderCanvas(ch);
    updateBudget(ch);
    state.vera.updateCommentary(`combined ${source.text} into ${target.text}`);
    state.vera.resetTimer();
  }

  function calcBudget(ch) {
    let total = 0;
    ch.sections.forEach(sec => {
      sec.items.forEach(item => {
        total += effectiveCost(item);
      });
    });
    return total;
  }

  function updateBudget(ch) {
    const budget = calcBudget(ch);
    const activeAnimations = ch.sections.flatMap(s => s.items)
      .filter(item => item.type === 'animation' && effectiveCost(item) > 0).length;
    document.getElementById('g6BudgetVal').textContent = budget;
    document.getElementById('g6BudgetRight').textContent = budget;

    // Meter fill: 100 = full, 0 = empty
    const pct = Math.min(100, budget);
    const fill = document.getElementById('g6BudgetFill');
    fill.style.height = pct + '%';
    fill.style.background = budget <= ch.budget ? '#4ADE80'
      : budget <= 70 ? '#F59E0B' : '#EF4444';

    state.vera.updateCommentary(
      budget <= ch.budget ? `budget ${budget} — target met!`
      : budget <= 70 ? `budget ${budget} — getting closer`
      : `${activeAnimations} animations active — ${budget - ch.budget} points over budget`
    );
  }

  function funcCheck() {
    const ch = CHALLENGES[state.challengeIdx];
    const removedEssential = ch.sections.flatMap(s => s.items)
      .filter(item => item.essential && state.removed.has(item.id) && !state.combinedInto[item.id]);

    if (removedEssential.length > 0) {
      state.vera.updateCommentary(`⚠ removed essential: ${removedEssential.map(i => i.text).join(', ')}`);
      state.vera.wrongAttempt();
    } else {
      const budget = calcBudget(ch);
      if (budget <= ch.budget) {
        if (!state.showingDebrief) {
          state.showingDebrief = true;
          showDebrief(ch, budget);
        }
      } else {
        state.vera.updateCommentary(`functionality OK — but still ${budget - ch.budget}pts over budget`);
      }
    }
  }

  function showDebrief(ch, budget) {
    const elapsed = (Date.now() - state.startTime) / 1000;
    let score = 100;
    if (budget > ch.budget) score -= (budget - ch.budget) * 2;
    if (elapsed < 60) score += 10;
    if (!state.vera.wasHintUsed()) score += 15;
    score = Math.max(0, Math.min(125, score));
    state.scores.push(score);

    const total = state.scores.reduce((a, b) => a + b, 0);
    document.getElementById('g6Score').textContent = total;
    document.getElementById('g6ScoreRight').textContent = total;

    const good = budget <= ch.budget
      ? `Budget reduced to ${budget} — target of ${ch.budget} achieved.`
      : `Budget at ${budget} — ${budget - ch.budget} over target.`;
    const miss = budget > ch.budget
      ? 'Remove more non-essential elements — animations and decorations cost the most.'
      : '';

    document.getElementById('g6DebriefGood').textContent = good;
    document.getElementById('g6DebriefMiss').textContent = miss;

    const overlay = document.getElementById('g6Debrief');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    state.vera.celebrate('cognitive budget optimised');
  }

  function nextChallenge() {
    const overlay = document.getElementById('g6Debrief');
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

    const saved = JSON.parse(localStorage.getItem('cognitive_game_scores') || '{}');
    saved['G06'] = { score: avg, xp, completedAt: new Date().toISOString() };
    localStorage.setItem('cognitive_game_scores', JSON.stringify(saved));

    const prog = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
    if (!prog.completedGames) prog.completedGames = [];
    if (!prog.completedGames.includes('G06')) prog.completedGames.push('G06');
    prog.totalXP = (prog.totalXP || 0) + xp;
    if (!prog.skillLevels) prog.skillLevels = {};
    prog.skillLevels.cognitive = Math.min(100, (prog.skillLevels.cognitive || 0) + Math.round(avg / 10));
    localStorage.setItem('gestalt_progress', JSON.stringify(prog));

    document.getElementById('g6XP').textContent = `+${xp} XP`;
    document.getElementById('g6PcScore').textContent = `Score: ${avg}`;

    const complete = document.getElementById('g6Complete');
    complete.style.display = 'flex';
    requestAnimationFrame(() => complete.classList.add('visible'));

    const el = document.getElementById('g6FinalScore');
    let cur = 0;
    const step = Math.ceil(avg / 60);
    const counter = setInterval(() => {
      cur = Math.min(cur + step, avg);
      el.textContent = cur;
      if (cur >= avg) clearInterval(counter);
    }, 16);

    document.getElementById('g6Return').addEventListener('click', () => window.returnToDashboard());
  }

  document.addEventListener('DOMContentLoaded', init);
})();
