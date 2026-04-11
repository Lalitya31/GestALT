(() => {
	'use strict';

	const CHALLENGES = [
		{
			id: 1,
			name: 'News article',
			blocks: [
				{ id: 'title', text: 'City Introduces New Transit Plan', targetRole: 'H1' },
				{ id: 'subtitle', text: 'A faster route network launches this summer.', targetRole: 'H3' },
				{ id: 'meta', text: 'By Editorial Desk • 4 min read', targetRole: 'METADATA' },
				{ id: 'body1', text: 'Officials announced three new express lines to reduce commute times.', targetRole: 'BODY' },
				{ id: 'body2', text: 'The rollout will prioritize crowded corridors and off-peak reliability.', targetRole: 'BODY' },
				{ id: 'cta', text: 'Read Full Plan', targetRole: 'BUTTON TEXT' },
			],
			expected: {
				H1: { size: [42, 72], weight: [600, 800], line: [1.0, 1.3], track: [-0.02, 0.03] },
				H3: { size: [24, 38], weight: [500, 700], line: [1.1, 1.5], track: [-0.01, 0.04] },
				METADATA: { size: [12, 16], weight: [300, 500], line: [1.2, 1.6], track: [0.01, 0.12] },
				BODY: { size: [16, 22], weight: [300, 500], line: [1.3, 1.8], track: [-0.01, 0.04] },
				'BUTTON TEXT': { size: [14, 20], weight: [500, 700], line: [1.0, 1.4], track: [0.0, 0.08] },
			},
		},
		{
			id: 2,
			name: 'SaaS dashboard card',
			blocks: [
				{ id: 'title', text: 'Monthly Revenue', targetRole: 'H2' },
				{ id: 'metric', text: '$124,200', targetRole: 'H1' },
				{ id: 'delta', text: '+8.4% vs last month', targetRole: 'CAPTION' },
				{ id: 'body1', text: 'Growth came from upgraded annual contracts.', targetRole: 'BODY' },
				{ id: 'cta', text: 'Open Analytics', targetRole: 'BUTTON TEXT' },
			],
			expected: {
				H1: { size: [36, 64], weight: [600, 800], line: [0.95, 1.2], track: [-0.03, 0.02] },
				H2: { size: [24, 40], weight: [500, 700], line: [1.0, 1.35], track: [-0.02, 0.04] },
				CAPTION: { size: [12, 16], weight: [300, 500], line: [1.2, 1.7], track: [0.0, 0.12] },
				BODY: { size: [15, 21], weight: [300, 500], line: [1.3, 1.8], track: [-0.01, 0.04] },
				'BUTTON TEXT': { size: [14, 20], weight: [500, 700], line: [1.0, 1.4], track: [0.0, 0.08] },
			},
		},
		{
			id: 3,
			name: 'Mobile onboarding',
			blocks: [
				{ id: 'title', text: 'Track Goals Daily', targetRole: 'H1' },
				{ id: 'subtitle', text: 'Set reminders and review streaks in one place.', targetRole: 'H3' },
				{ id: 'body1', text: 'A simple timeline helps you stay consistent.', targetRole: 'BODY' },
				{ id: 'body2', text: 'Progress snapshots are shared each week.', targetRole: 'BODY' },
				{ id: 'cta', text: 'Get Started', targetRole: 'BUTTON TEXT' },
			],
			expected: {
				H1: { size: [34, 58], weight: [600, 800], line: [1.0, 1.3], track: [-0.03, 0.02] },
				H3: { size: [22, 32], weight: [500, 700], line: [1.1, 1.5], track: [-0.02, 0.04] },
				BODY: { size: [16, 21], weight: [300, 500], line: [1.35, 1.85], track: [-0.01, 0.04] },
				'BUTTON TEXT': { size: [14, 20], weight: [500, 700], line: [1.0, 1.4], track: [0.0, 0.08] },
			},
		},
	];

	const ROLE_RANK = {
		H1: 7,
		H2: 6,
		H3: 5,
		BODY: 4,
		'BUTTON TEXT': 3,
		LABEL: 2,
		CAPTION: 1,
		METADATA: 1,
	};

	const state = {
		idx: 0,
		challengeScore: [],
		roleMap: {},
		activeBlockId: null,
		vera: null,
		showingDebrief: false,
	};

	function init() {
		const brief = document.getElementById('g11Brief');
		if (!brief) return;

		brief.addEventListener('click', start);
		document.getElementById('g11TheoryToggle').addEventListener('click', () => {
			document.getElementById('g11Theory').classList.toggle('collapsed');
		});
		document.getElementById('g11RoleSelect').addEventListener('change', applyControlsToActive);
		document.getElementById('g11Size').addEventListener('input', applyControlsToActive);
		document.getElementById('g11Weight').addEventListener('input', applyControlsToActive);
		document.getElementById('g11Line').addEventListener('input', applyControlsToActive);
		document.getElementById('g11Track').addEventListener('input', applyControlsToActive);
		document.getElementById('g11Color').addEventListener('input', applyControlsToActive);
		document.getElementById('g11Submit').addEventListener('click', submit);
		document.getElementById('g11Next').addEventListener('click', next);
		document.getElementById('g11Return').addEventListener('click', () => window.returnToDashboard());

		state.vera = new VERASystem();
		state.vera.init({
			orbId: 'g11VeraOrb',
			commentId: 'g11VeraComment',
			hintQuestion: 'Can you identify the first, second, and third thing a reader sees at 2 meters?',
			interventionText: 'Start with role assignment, then tune size and spacing until scan order becomes obvious.',
		});
	}

	function start() {
		const brief = document.getElementById('g11Brief');
		brief.classList.add('dismissed');
		setTimeout(() => { brief.style.display = 'none'; }, 350);
		document.getElementById('g11Header').style.display = 'flex';
		document.getElementById('g11Arena').style.display = 'flex';
		loadChallenge(0);
		state.vera.startTimer();
	}

	function loadChallenge(idx) {
		state.idx = idx;
		state.roleMap = {};
		state.activeBlockId = null;
		state.showingDebrief = false;
		state.vera.resetTimer();

		const ch = CHALLENGES[idx % CHALLENGES.length];
		document.getElementById('g11Counter').textContent = `CHALLENGE ${String(idx + 1).padStart(2, '0')} / 10`;
		document.getElementById('g11Scenario').textContent = `${ch.name}: style each block and submit hierarchy.`;

		const wall = document.getElementById('g11Wall');
		wall.innerHTML = '';

		ch.blocks.forEach((block, i) => {
			state.roleMap[block.id] = {
				role: i === 0 ? 'H1' : 'BODY',
				size: i === 0 ? 42 : 18,
				weight: i === 0 ? 700 : 400,
				line: 1.4,
				track: 0,
				color: '#E0E0FF',
			};

			const node = document.createElement('div');
			node.className = 'th-block';
			node.dataset.blockId = block.id;
			node.textContent = block.text;
			node.addEventListener('click', () => selectBlock(block.id));
			wall.appendChild(node);
		});

		selectBlock(ch.blocks[0].id);
		renderBlockStyles();
		updateReadabilityMetrics();
	}

	function selectBlock(blockId) {
		state.activeBlockId = blockId;
		const map = state.roleMap[blockId];

		document.querySelectorAll('#g11Wall .th-block').forEach(el => {
			el.classList.toggle('selected', el.dataset.blockId === blockId);
		});

		document.getElementById('g11RoleSelect').value = map.role;
		document.getElementById('g11Size').value = map.size;
		document.getElementById('g11Weight').value = map.weight;
		document.getElementById('g11Line').value = map.line;
		document.getElementById('g11Track').value = map.track;
		document.getElementById('g11Color').value = map.color;
		paintControlValues();
	}

	function applyControlsToActive() {
		if (!state.activeBlockId) return;
		const map = state.roleMap[state.activeBlockId];
		map.role = document.getElementById('g11RoleSelect').value;
		map.size = Number(document.getElementById('g11Size').value);
		map.weight = Number(document.getElementById('g11Weight').value);
		map.line = Number(document.getElementById('g11Line').value);
		map.track = Number(document.getElementById('g11Track').value);
		map.color = document.getElementById('g11Color').value;

		paintControlValues();
		renderBlockStyles();
		updateReadabilityMetrics();
		state.vera.resetTimer();
	}

	function paintControlValues() {
		document.getElementById('g11SizeVal').textContent = `${document.getElementById('g11Size').value}px`;
		document.getElementById('g11WeightVal').textContent = document.getElementById('g11Weight').value;
		document.getElementById('g11LineVal').textContent = Number(document.getElementById('g11Line').value).toFixed(2);
		document.getElementById('g11TrackVal').textContent = `${Number(document.getElementById('g11Track').value).toFixed(2)}em`;
	}

	function renderBlockStyles() {
		document.querySelectorAll('#g11Wall .th-block').forEach(el => {
			const m = state.roleMap[el.dataset.blockId];
			el.style.fontSize = `${m.size}px`;
			el.style.fontWeight = String(m.weight);
			el.style.lineHeight = String(m.line);
			el.style.letterSpacing = `${m.track}em`;
			el.style.color = m.color;
		});
	}

	function updateReadabilityMetrics() {
		const ch = CHALLENGES[state.idx % CHALLENGES.length];
		let roleHits = 0;
		const rankPairs = [];

		ch.blocks.forEach(block => {
			const m = state.roleMap[block.id];
			if (m.role === block.targetRole) roleHits += 1;
			rankPairs.push({ rank: ROLE_RANK[m.role] || 1, size: m.size });
		});

		let orderScore = 0;
		for (let i = 1; i < rankPairs.length; i += 1) {
			const prev = rankPairs[i - 1];
			const cur = rankPairs[i];
			if (prev.rank >= cur.rank && prev.size >= cur.size - 1) orderScore += 1;
		}

		const roleScore = ch.blocks.length ? roleHits / ch.blocks.length : 0;
		const seqScore = rankPairs.length > 1 ? orderScore / (rankPairs.length - 1) : 1;
		const total = Math.round((roleScore * 0.6 + seqScore * 0.4) * 100);

		document.getElementById('g11HScore').textContent = `${total}%`;
		document.getElementById('g11Readability').textContent = total >= 75 ? 'HIGH' : (total >= 50 ? 'MED' : 'LOW');
		document.getElementById('g11EyeFlow').textContent = seqScore >= 0.7 ? 'CLEAR' : 'NOISY';
	}

	function scoreBlock(expected, actual) {
		if (!expected) return 0.5;
		let points = 0;
		let denom = 5;

		points += actual.role in ROLE_RANK ? (actual.role === actual.targetRole ? 1 : 0) : 0;

		points += inRangeScore(actual.size, expected.size);
		points += inRangeScore(actual.weight, expected.weight);
		points += inRangeScore(actual.line, expected.line);
		points += inRangeScore(actual.track, expected.track);
		return points / denom;
	}

	function inRangeScore(v, range) {
		const min = range[0];
		const max = range[1];
		if (v >= min && v <= max) return 1;
		const dist = v < min ? (min - v) : (v - max);
		const tol = (max - min) * 0.5 + 0.001;
		return Math.max(0, 1 - dist / tol);
	}

	function submit() {
		if (state.showingDebrief) return;
		const ch = CHALLENGES[state.idx % CHALLENGES.length];

		let quality = 0;
		let roleHits = 0;
		ch.blocks.forEach(block => {
			const actual = state.roleMap[block.id];
			actual.targetRole = block.targetRole;
			if (actual.role === block.targetRole) roleHits += 1;
			quality += scoreBlock(ch.expected[block.targetRole], actual);
		});

		quality = ch.blocks.length ? quality / ch.blocks.length : 0;
		let score = Math.round(quality * 100);
		if (!state.vera.wasHintUsed()) score += 10;
		score = Math.min(125, Math.max(0, score));

		state.challengeScore.push(score);
		state.showingDebrief = true;

		const total = state.challengeScore.reduce((a, b) => a + b, 0);
		document.getElementById('g11Score').textContent = String(total);

		const bad = [];
		ch.blocks.forEach(block => {
			const actual = state.roleMap[block.id];
			if (actual.role !== block.targetRole) bad.push(`"${block.text.slice(0, 20)}..." set as ${actual.role}, expected ${block.targetRole}`);
		});

		document.getElementById('g11DebriefGood').textContent =
			`Role matches: ${roleHits}/${ch.blocks.length}. Hierarchy quality ${(quality * 100).toFixed(0)}%.`;
		document.getElementById('g11DebriefMiss').textContent = bad.length ? bad.slice(0, 3).join(' | ') : 'Strong role alignment and type contrast.';

		const overlay = document.getElementById('g11Debrief');
		overlay.style.display = 'flex';
		requestAnimationFrame(() => overlay.classList.add('visible'));
		state.vera.celebrate('hierarchy sculpted');
	}

	function next() {
		const overlay = document.getElementById('g11Debrief');
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
		const total = state.challengeScore.reduce((a, b) => a + b, 0);
		const avg = Math.round(total / state.challengeScore.length);
		const xp = avg * 10;

		const saved = JSON.parse(localStorage.getItem('typography_game_scores') || '{}');
		saved.G11 = { score: avg, xp, completedAt: new Date().toISOString() };
		localStorage.setItem('typography_game_scores', JSON.stringify(saved));

		const progress = JSON.parse(localStorage.getItem('gestalt_progress') || '{}');
		if (!progress.completedGames) progress.completedGames = [];
		if (!progress.completedGames.includes('G11')) progress.completedGames.push('G11');
		progress.totalXP = (progress.totalXP || 0) + xp;
		if (!progress.skillLevels) progress.skillLevels = {};
		progress.skillLevels.typography = Math.min(100, (progress.skillLevels.typography || 0) + Math.round(avg / 10));
		localStorage.setItem('gestalt_progress', JSON.stringify(progress));

		document.getElementById('g11FinalScore').textContent = String(avg);
		document.getElementById('g11XP').textContent = `+${xp} XP`;
		document.getElementById('g11PcScore').textContent = `Score: ${avg}`;

		const complete = document.getElementById('g11Complete');
		complete.style.display = 'flex';
		requestAnimationFrame(() => complete.classList.add('visible'));
	}

	document.addEventListener('DOMContentLoaded', init);
})();
