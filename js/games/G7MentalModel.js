(function () {
	'use strict';

	const FUNCTIONS = ['SEARCH', 'SETTINGS', 'NOTIFICATIONS', 'PROFILE', 'MESSAGES', 'HELP', 'SAVE', 'FILTERS'];

	const CHALLENGES = [
		{ id: 1, scenario: 'Email client shell', target: 70, actual: actualFromPreset('classic') },
		{ id: 2, scenario: 'Social feed frame', target: 70, actual: actualFromPreset('social') },
		{ id: 3, scenario: 'Settings dashboard', target: 70, actual: actualFromPreset('settings') },
		{ id: 4, scenario: 'Enterprise analytics suite', target: 72, actual: actualFromPreset('enterpriseA') },
		{ id: 5, scenario: 'Enterprise operations panel', target: 72, actual: actualFromPreset('enterpriseB') },
		{ id: 6, scenario: 'Novel spatial app', target: 68, actual: actualFromPreset('novelA') },
		{ id: 7, scenario: 'Novel AI control board', target: 68, actual: actualFromPreset('novelB') },
		{ id: 8, scenario: 'Cross-cultural context A', target: 74, actual: actualFromPreset('cultureA') },
		{ id: 9, scenario: 'Cross-cultural context B', target: 74, actual: actualFromPreset('cultureB') },
		{ id: 10, scenario: 'Design from scratch', target: 75, actual: actualFromPreset('optimal') },
	];

	let state = {
		idx: 0,
		scores: [],
		phase: 'predict',
		predictions: [],
		predScore: 0,
		activePromptIdx: 0,
		uiRect: null,
		draggables: {},
		drag: null,
		startTime: 0,
		vera: null,
		showingDebrief: false,
	};

	function init() {
		document.getElementById('g7Brief').addEventListener('click', startGame);
		document.getElementById('g7TheoryToggle').addEventListener('click', () => {
			document.getElementById('g7Theory').classList.toggle('collapsed');
		});
		document.getElementById('g7Submit').addEventListener('click', submitPredictions);
		document.getElementById('g7SubmitRedesign').addEventListener('click', submitRedesign);
		document.getElementById('g7Next').addEventListener('click', nextChallenge);
		document.getElementById('g7Return').addEventListener('click', () => window.returnToDashboard());

		const pinsLayer = document.getElementById('g7Pins');
		pinsLayer.addEventListener('click', onPredictClick);

		state.vera = new VERASystem();
		state.vera.init({
			orbId: 'g7VeraOrb',
			commentId: 'g7VeraComment',
			hintQuestion: 'What other apps do users already know that do this same thing?',
			interventionText: 'Start from known anchors: search near top, settings near profile or nav.',
		});
	}

	function startGame() {
		const brief = document.getElementById('g7Brief');
		brief.classList.add('dismissed');
		setTimeout(() => { brief.style.display = 'none'; }, 400);
		document.getElementById('g7Header').style.display = 'flex';
		document.getElementById('g7Arena').style.display = 'flex';
		loadChallenge(0);
		state.vera.startTimer();
	}

	function loadChallenge(idx) {
		state.idx = idx;
		state.phase = 'predict';
		state.predictions = [];
		state.predScore = 0;
		state.activePromptIdx = 0;
		state.draggables = {};
		state.drag = null;
		state.showingDebrief = false;
		state.startTime = Date.now();

		const ch = CHALLENGES[idx];
		document.getElementById('g7Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
		document.getElementById('g7Instruction').textContent = `Click where you think ${FUNCTIONS[0]} lives.`;
		document.getElementById('g7PhaseLabel').textContent = 'PHASE A - PREDICT';
		document.getElementById('g7PhaseDesc').textContent = 'Click where you think each function lives.';
		document.getElementById('g7Submit').style.display = 'inline-flex';
		document.getElementById('g7SubmitRedesign').style.display = 'none';
		document.getElementById('g7Submit').textContent = 'SUBMIT PREDICTIONS';
		document.getElementById('g7Submit').disabled = true;
		document.getElementById('g7MMScore').textContent = '0%';
		document.getElementById('g7Accuracy').textContent = '0%';

		renderScenario(ch);
		clearPins();
		state.vera.updateCommentary(`predict user expectation for ${ch.scenario.toLowerCase()}`);
	}

	function renderScenario(ch) {
		const ui = document.getElementById('g7UI');
		const pins = document.getElementById('g7Pins');
		ui.innerHTML = '';
		pins.innerHTML = '';

		const shell = document.createElement('div');
		shell.style.cssText = 'position:relative;width:100%;height:380px;background:linear-gradient(145deg,#111,#1A1A1A);';
		shell.innerHTML = `
			<div style="position:absolute;left:0;right:0;top:0;height:44px;border-bottom:1px solid #2A2A2A;background:#111;"></div>
			<div style="position:absolute;left:0;top:44px;bottom:0;width:88px;border-right:1px solid #2A2A2A;background:#101010;"></div>
			<div style="position:absolute;left:104px;right:16px;top:64px;bottom:16px;background:#141414;border:1px solid #202020;"></div>
			<div style="position:absolute;left:116px;top:78px;width:38%;height:12px;background:#1f1f1f;filter:blur(2.4px);"></div>
			<div style="position:absolute;left:116px;top:98px;width:30%;height:8px;background:#1a1a1a;filter:blur(2.4px);"></div>
		`;
		ui.appendChild(shell);

		state.uiRect = pins.getBoundingClientRect();
	}

	function onPredictClick(e) {
		if (state.phase !== 'predict') return;
		const pins = document.getElementById('g7Pins');
		const rect = pins.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const fn = FUNCTIONS[state.activePromptIdx];
		if (!fn) return;

		state.predictions.push({ fn, x, y });
		drawPin(x, y, fn, false);
		state.activePromptIdx++;
		state.vera.resetTimer();

		if (state.activePromptIdx >= FUNCTIONS.length) {
			document.getElementById('g7Instruction').textContent = 'All predictions placed. Submit to reveal actual locations.';
			document.getElementById('g7Submit').disabled = false;
		} else {
			document.getElementById('g7Instruction').textContent = `Click where you think ${FUNCTIONS[state.activePromptIdx]} lives.`;
		}
	}

	function drawPin(x, y, label, correct) {
		const pins = document.getElementById('g7Pins');
		const pin = document.createElement('div');
		pin.className = 'mm-pin';
		pin.style.left = x + 'px';
		pin.style.top = y + 'px';
		pin.innerHTML = `<span class="mm-pin-dot ${correct ? 'correct' : ''}"></span><span class="mm-pin-label">${label}</span>`;
		pins.appendChild(pin);
	}

	function drawActual(x, y) {
		const pins = document.getElementById('g7Pins');
		const dot = document.createElement('span');
		dot.className = 'mm-actual-dot';
		dot.style.left = x + 'px';
		dot.style.top = y + 'px';
		pins.appendChild(dot);
	}

	function submitPredictions() {
		if (state.phase !== 'predict' || state.predictions.length !== FUNCTIONS.length) return;
		const ch = CHALLENGES[state.idx];
		const actualPx = actualToPixels(ch.actual);

		let distanceSum = 0;
		state.predictions.forEach(pred => {
			const a = actualPx[pred.fn];
			const d = Math.hypot(pred.x - a.x, pred.y - a.y);
			distanceSum += d;
			drawActual(a.x, a.y);
		});

		const avgDist = distanceSum / FUNCTIONS.length;
		const predAccuracy = clamp(100 - Math.round((avgDist / 260) * 100), 0, 100);
		state.predScore = Math.round(predAccuracy * 0.5);
		document.getElementById('g7Accuracy').textContent = predAccuracy + '%';
		document.getElementById('g7MMScore').textContent = predAccuracy + '%';

		state.phase = 'redesign';
		document.getElementById('g7PhaseLabel').textContent = 'PHASE B - REDESIGN';
		document.getElementById('g7PhaseDesc').textContent = 'Drag elements to align with where users predicted.';
		document.getElementById('g7Instruction').textContent = `Move functions to achieve at least ${ch.target}% alignment.`;
		document.getElementById('g7Submit').style.display = 'none';
		document.getElementById('g7SubmitRedesign').style.display = 'inline-flex';
		renderDraggables(actualPx);
		updateMMScore();
		state.vera.updateCommentary('redesign for expectation alignment');
	}

	function renderDraggables(actualPx) {
		const ui = document.getElementById('g7UI');
		FUNCTIONS.forEach(fn => {
			const el = document.createElement('div');
			el.className = 'mm-draggable';
			el.dataset.fn = fn;
			el.textContent = fn;
			el.style.cssText = `
				left:${actualPx[fn].x - 38}px;top:${actualPx[fn].y - 12}px;
				min-width:76px;padding:4px 8px;background:#111;border:1px solid #2A2A2A;
				color:#E0E0FF;font:11px 'JetBrains Mono',monospace;text-align:center;z-index:3;
			`;
			ui.appendChild(el);
			makeDraggable(el);
			state.draggables[fn] = { x: actualPx[fn].x, y: actualPx[fn].y, el };
		});
	}

	function makeDraggable(el) {
		el.addEventListener('mousedown', e => {
			if (state.phase !== 'redesign') return;
			const rect = el.getBoundingClientRect();
			state.drag = { el, dx: e.clientX - rect.left, dy: e.clientY - rect.top };
			el.style.cursor = 'grabbing';
		});

		window.addEventListener('mousemove', e => {
			if (!state.drag || state.drag.el !== el || state.phase !== 'redesign') return;
			const uiRect = document.getElementById('g7UI').getBoundingClientRect();
			const x = clamp(e.clientX - uiRect.left - state.drag.dx, 0, uiRect.width - 90);
			const y = clamp(e.clientY - uiRect.top - state.drag.dy, 0, uiRect.height - 28);
			el.style.left = x + 'px';
			el.style.top = y + 'px';
			const fn = el.dataset.fn;
			state.draggables[fn].x = x + 38;
			state.draggables[fn].y = y + 12;
			updateMMScore();
		});

		window.addEventListener('mouseup', () => {
			if (!state.drag || state.drag.el !== el) return;
			el.style.cursor = 'grab';
			state.drag = null;
		});
	}

	function updateMMScore() {
		if (state.phase !== 'redesign') return;
		const total = FUNCTIONS.reduce((sum, fn) => {
			const pred = state.predictions.find(p => p.fn === fn);
			const cur = state.draggables[fn];
			if (!pred || !cur) return sum;
			const d = Math.hypot(pred.x - cur.x, pred.y - cur.y);
			const s = clamp(100 - (d / 240) * 100, 0, 100);
			return sum + s;
		}, 0);

		const mm = Math.round(total / FUNCTIONS.length);
		document.getElementById('g7MMScore').textContent = mm + '%';
		state.vera.updateCommentary(`alignment ${mm}%`);
		return mm;
	}

	function submitRedesign() {
		if (state.phase !== 'redesign' || state.showingDebrief) return;
		const mm = updateMMScore();
		const ch = CHALLENGES[state.idx];
		if (mm < ch.target) {
			state.vera.wrongAttempt();
			state.vera.updateCommentary(`need ${ch.target}%+, current ${mm}%`);
			return;
		}

		state.showingDebrief = true;
		const redesignScore = Math.round(mm * 0.5);
		const elapsed = (Date.now() - state.startTime) / 1000;
		let score = state.predScore + redesignScore;
		if (elapsed < 150) score += 10;
		if (!state.vera.wasHintUsed()) score += 15;
		score = clamp(score, 0, 125);
		state.scores.push(score);

		const total = state.scores.reduce((a, b) => a + b, 0);
		document.getElementById('g7Score').textContent = total;
		document.getElementById('g7ScoreRight').textContent = total;

		document.getElementById('g7DebriefGood').textContent =
			`Prediction ${state.predScore}/50, redesign ${redesignScore}/50. Final alignment ${mm}%.`;
		document.getElementById('g7DebriefMiss').textContent =
			mm < 82 ? 'Anchor key functions to familiar locations to reduce hesitation.' : 'Strong alignment with user expectations.';

		const overlay = document.getElementById('g7Debrief');
		overlay.style.display = 'flex';
		requestAnimationFrame(() => overlay.classList.add('visible'));
		state.vera.celebrate('mental model alignment improved');
	}

	function nextChallenge() {
		const overlay = document.getElementById('g7Debrief');
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
		saved.G07 = { score: avg, xp, completedAt: new Date().toISOString() };
		localStorage.setItem('cognitive_game_scores', JSON.stringify(saved));

		const prog = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
		if (!prog.completedGames) prog.completedGames = [];
		if (!prog.completedGames.includes('G07')) prog.completedGames.push('G07');
		prog.totalXP = (prog.totalXP || 0) + xp;
		if (!prog.skillLevels) prog.skillLevels = {};
		prog.skillLevels.cognitive = Math.min(100, (prog.skillLevels.cognitive || 0) + Math.round(avg / 10));
		localStorage.setItem('gestalt_progress', JSON.stringify(prog));

		document.getElementById('g7XP').textContent = `+${xp} XP`;
		document.getElementById('g7PcScore').textContent = `Score: ${avg}`;

		const complete = document.getElementById('g7Complete');
		complete.style.display = 'flex';
		requestAnimationFrame(() => complete.classList.add('visible'));

		const el = document.getElementById('g7FinalScore');
		let cur = 0;
		const step = Math.ceil(avg / 60);
		const t = setInterval(() => {
			cur = Math.min(cur + step, avg);
			el.textContent = cur;
			if (cur >= avg) clearInterval(t);
		}, 16);
	}

	function clearPins() {
		document.getElementById('g7Pins').innerHTML = '';
	}

	function actualToPixels(map) {
		const pins = document.getElementById('g7Pins');
		const rect = pins.getBoundingClientRect();
		const px = {};
		Object.keys(map).forEach(k => {
			px[k] = {
				x: Math.round((map[k].x / 100) * rect.width),
				y: Math.round((map[k].y / 100) * rect.height),
			};
		});
		return px;
	}

	function actualFromPreset(type) {
		const presets = {
			classic: {
				SEARCH:{x:28,y:11}, SETTINGS:{x:90,y:11}, NOTIFICATIONS:{x:84,y:11}, PROFILE:{x:95,y:11},
				MESSAGES:{x:18,y:28}, HELP:{x:18,y:40}, SAVE:{x:90,y:88}, FILTERS:{x:22,y:20}
			},
			social: {
				SEARCH:{x:22,y:11}, SETTINGS:{x:93,y:11}, NOTIFICATIONS:{x:86,y:11}, PROFILE:{x:95,y:11},
				MESSAGES:{x:8,y:56}, HELP:{x:8,y:70}, SAVE:{x:90,y:88}, FILTERS:{x:18,y:20}
			},
			settings: {
				SEARCH:{x:34,y:11}, SETTINGS:{x:14,y:16}, NOTIFICATIONS:{x:14,y:28}, PROFILE:{x:14,y:40},
				MESSAGES:{x:14,y:52}, HELP:{x:14,y:64}, SAVE:{x:84,y:88}, FILTERS:{x:44,y:16}
			},
			enterpriseA: {
				SEARCH:{x:50,y:11}, SETTINGS:{x:95,y:16}, NOTIFICATIONS:{x:95,y:28}, PROFILE:{x:95,y:40},
				MESSAGES:{x:8,y:44}, HELP:{x:8,y:56}, SAVE:{x:88,y:88}, FILTERS:{x:10,y:16}
			},
			enterpriseB: {
				SEARCH:{x:18,y:11}, SETTINGS:{x:10,y:72}, NOTIFICATIONS:{x:90,y:11}, PROFILE:{x:96,y:11},
				MESSAGES:{x:10,y:56}, HELP:{x:10,y:84}, SAVE:{x:82,y:88}, FILTERS:{x:28,y:18}
			},
			novelA: {
				SEARCH:{x:70,y:16}, SETTINGS:{x:26,y:14}, NOTIFICATIONS:{x:50,y:84}, PROFILE:{x:92,y:70},
				MESSAGES:{x:16,y:66}, HELP:{x:82,y:86}, SAVE:{x:50,y:90}, FILTERS:{x:40,y:20}
			},
			novelB: {
				SEARCH:{x:12,y:20}, SETTINGS:{x:88,y:20}, NOTIFICATIONS:{x:18,y:82}, PROFILE:{x:84,y:82},
				MESSAGES:{x:52,y:12}, HELP:{x:52,y:88}, SAVE:{x:52,y:50}, FILTERS:{x:28,y:50}
			},
			cultureA: {
				SEARCH:{x:18,y:11}, SETTINGS:{x:90,y:11}, NOTIFICATIONS:{x:82,y:11}, PROFILE:{x:96,y:11},
				MESSAGES:{x:12,y:54}, HELP:{x:12,y:68}, SAVE:{x:86,y:88}, FILTERS:{x:26,y:20}
			},
			cultureB: {
				SEARCH:{x:82,y:11}, SETTINGS:{x:10,y:11}, NOTIFICATIONS:{x:18,y:11}, PROFILE:{x:4,y:11},
				MESSAGES:{x:88,y:54}, HELP:{x:88,y:68}, SAVE:{x:14,y:88}, FILTERS:{x:74,y:20}
			},
			optimal: {
				SEARCH:{x:24,y:11}, SETTINGS:{x:90,y:11}, NOTIFICATIONS:{x:84,y:11}, PROFILE:{x:95,y:11},
				MESSAGES:{x:10,y:40}, HELP:{x:10,y:54}, SAVE:{x:88,y:88}, FILTERS:{x:24,y:22}
			},
		};
		return presets[type];
	}

	function clamp(v, min, max) {
		return Math.max(min, Math.min(max, v));
	}

	document.addEventListener('DOMContentLoaded', init);
})();
