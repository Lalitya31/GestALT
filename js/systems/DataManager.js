/* DataManager.js
 * Centralized persistence layer with corruption-safe storage and cached reads.
 */
(function () {
  'use strict';

  const MANAGED_KEYS = {
    gestalt_quiz_results: {},
    gestalt_progress: {
      completedGames: [],
      currentGame: 'G01',
      totalXP: 0,
      level: 1,
      streak: 0,
      lastPlayedAt: null,
      skillLevels: {
        gestalt: 0,
        cognitive: 0,
        typography: 0,
        color: 0,
        interaction: 0,
        strategy: 0,
      },
    },
    gestalt_game_scores: {},
    cognitive_game_scores: {},
    typography_game_scores: {},
    color_game_scores: {},
    interaction_game_scores: {},
    strategy_game_scores: {},
  };

  const SCORE_GROUPS = {
    gestalt: 'gestalt_game_scores',
    cognitive: 'cognitive_game_scores',
    typography: 'typography_game_scores',
    color: 'color_game_scores',
    interaction: 'interaction_game_scores',
    strategy: 'strategy_game_scores',
  };

  class DataManager {
    constructor() {
      this.cache = Object.create(null);
      this._storage = window.localStorage;
      this._nativeGet = this._storage.getItem.bind(this._storage);
      this._nativeSet = this._storage.setItem.bind(this._storage);
      this._nativeRemove = this._storage.removeItem.bind(this._storage);

      this._installStorageProxy();
      this._primeCache();
      this.syncProgressFromScores();
    }

    _installStorageProxy() {
      const self = this;
      this._storage.getItem = function proxiedGetItem(key) {
        if (!Object.prototype.hasOwnProperty.call(MANAGED_KEYS, key)) {
          return self._nativeGet(key);
        }
        return self.getRaw(key);
      };

      this._storage.setItem = function proxiedSetItem(key, value) {
        if (!Object.prototype.hasOwnProperty.call(MANAGED_KEYS, key)) {
          self._nativeSet(key, value);
          return;
        }
        self.setRaw(key, value);
      };
    }

    _cloneDefault(key) {
      const value = MANAGED_KEYS[key];
      return JSON.parse(JSON.stringify(value));
    }

    _primeCache() {
      Object.keys(MANAGED_KEYS).forEach((key) => {
        this.getJSON(key);
      });
    }

    getRaw(key) {
      if (!Object.prototype.hasOwnProperty.call(MANAGED_KEYS, key)) {
        return this._nativeGet(key);
      }

      if (Object.prototype.hasOwnProperty.call(this.cache, key)) {
        return this.cache[key];
      }

      const value = this._nativeGet(key);
      if (value == null) {
        const safeDefault = JSON.stringify(this._cloneDefault(key));
        this.cache[key] = safeDefault;
        this._nativeSet(key, safeDefault);
        return safeDefault;
      }

      try {
        JSON.parse(value);
        this.cache[key] = value;
        return value;
      } catch (err) {
        const safeDefault = JSON.stringify(this._cloneDefault(key));
        this.cache[key] = safeDefault;
        this._nativeSet(key, safeDefault);
        return safeDefault;
      }
    }

    setRaw(key, value) {
      if (!Object.prototype.hasOwnProperty.call(MANAGED_KEYS, key)) {
        this._nativeSet(key, value);
        return;
      }

      let serialized = value;
      if (typeof serialized !== 'string') {
        serialized = JSON.stringify(serialized);
      }

      try {
        JSON.parse(serialized);
      } catch (err) {
        serialized = JSON.stringify(this._cloneDefault(key));
      }

      this.cache[key] = serialized;
      this._nativeSet(key, serialized);

      if (key !== 'gestalt_progress') {
        this.syncProgressFromScores();
      } else {
        this._emitDataUpdated();
      }
    }

    getJSON(key) {
      const raw = this.getRaw(key);
      try {
        return JSON.parse(raw);
      } catch (err) {
        const fallback = this._cloneDefault(key);
        this.setJSON(key, fallback);
        return fallback;
      }
    }

    setJSON(key, payload) {
      this.setRaw(key, JSON.stringify(payload));
    }

    getAll() {
      const out = {};
      Object.keys(MANAGED_KEYS).forEach((key) => {
        out[key] = this.getJSON(key);
      });
      return out;
    }

    _collectScores() {
      const bundles = {};
      Object.entries(SCORE_GROUPS).forEach(([domain, key]) => {
        bundles[domain] = this.getJSON(key);
      });
      return bundles;
    }

    computeAggregateSkillLevels() {
      const bundles = this._collectScores();
      const levels = {};

      Object.entries(bundles).forEach(([domain, scoreMap]) => {
        const entries = Object.values(scoreMap || {});
        if (!entries.length) {
          levels[domain] = 0;
          return;
        }
        const avg = entries.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / entries.length;
        levels[domain] = Math.max(0, Math.min(100, Math.round(avg)));
      });

      return levels;
    }

    _computeTotalXP() {
      const bundles = this._collectScores();
      let xp = 0;
      Object.values(bundles).forEach((scoreMap) => {
        Object.values(scoreMap || {}).forEach((entry) => {
          xp += Number(entry.xp) || 0;
        });
      });
      return xp;
    }

    _collectCompletedGames() {
      const bundles = this._collectScores();
      const set = new Set();
      Object.values(bundles).forEach((scoreMap) => {
        Object.keys(scoreMap || {}).forEach((gameId) => set.add(gameId));
      });
      return Array.from(set).sort();
    }

    _syncStreak(progress) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last = progress.lastPlayedAt ? new Date(progress.lastPlayedAt) : null;

      if (!last || Number.isNaN(last.getTime())) {
        progress.streak = progress.streak || 0;
        return;
      }

      const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const diffDays = Math.floor((today - lastDay) / 86400000);

      if (diffDays > 1) {
        progress.streak = 0;
      }
    }

    syncProgressFromScores() {
      const progress = this.getJSON('gestalt_progress');
      progress.completedGames = this._collectCompletedGames();
      progress.totalXP = this._computeTotalXP();
      progress.level = Math.max(1, Math.floor(progress.totalXP / 1000) + 1);
      progress.skillLevels = {
        ...(progress.skillLevels || {}),
        ...this.computeAggregateSkillLevels(),
      };

      if (!progress.lastPlayedAt) {
        progress.lastPlayedAt = new Date().toISOString();
      }

      this._syncStreak(progress);

      this.cache.gestalt_progress = JSON.stringify(progress);
      this._nativeSet('gestalt_progress', this.cache.gestalt_progress);
      this._emitDataUpdated();
      return progress;
    }

    markPlayActivity() {
      const progress = this.getJSON('gestalt_progress');
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last = progress.lastPlayedAt ? new Date(progress.lastPlayedAt) : null;
      const lastDay = last && !Number.isNaN(last.getTime()) ? new Date(last.getFullYear(), last.getMonth(), last.getDate()) : null;

      if (!lastDay) {
        progress.streak = 1;
      } else {
        const diffDays = Math.floor((today - lastDay) / 86400000);
        if (diffDays === 1) progress.streak = (progress.streak || 0) + 1;
        if (diffDays > 1) progress.streak = 1;
      }

      progress.lastPlayedAt = now.toISOString();
      this.setJSON('gestalt_progress', progress);
    }

    refreshDashboardUI() {
      const all = this.getAll();
      const progress = all.gestalt_progress;

      const xpEl = document.getElementById('totalXP');
      if (xpEl) xpEl.textContent = String(progress.totalXP || 0);

      const streakEl = document.getElementById('currentStreak');
      if (streakEl) streakEl.textContent = String(progress.streak || 0);

      const ring = document.querySelector('[data-xp-ring-progress]');
      if (ring) {
        const pct = Math.max(0, Math.min(100, Math.round(((progress.totalXP || 0) % 1000) / 10)));
        ring.style.transform = 'rotate(-90deg)';
        ring.style.strokeDasharray = `${pct} 100`;
      }

      document.querySelectorAll('[data-skill]').forEach((el) => {
        const key = el.getAttribute('data-skill');
        const value = (progress.skillLevels && progress.skillLevels[key]) || 0;
        const bar = el.querySelector('[data-skill-fill]');
        const val = el.querySelector('[data-skill-value]');
        if (bar) bar.style.width = `${value}%`;
        if (val) val.textContent = `${value}%`;
      });

      const completed = new Set(progress.completedGames || []);
      const current = progress.currentGame || null;
      document.querySelectorAll('[data-game-id]').forEach((node) => {
        const gid = node.getAttribute('data-game-id');
        node.classList.remove('completed', 'available', 'locked', 'current');
        if (completed.has(gid)) node.classList.add('completed');
        else node.classList.add('available');
        if (current === gid) node.classList.add('current');
      });

      this._emitDataUpdated();
    }

    _emitDataUpdated() {
      window.dispatchEvent(new CustomEvent('gestalt:data-updated', {
        detail: { progress: this.getJSON('gestalt_progress') },
      }));
    }

    resetCorruptData() {
      Object.keys(MANAGED_KEYS).forEach((key) => {
        const value = JSON.stringify(this._cloneDefault(key));
        this.cache[key] = value;
        this._nativeSet(key, value);
      });
      this._emitDataUpdated();
    }
  }

  window.DataManager = DataManager;
  window.gestaltDataManager = new DataManager();
})();
