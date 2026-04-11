/* VERASystem.js — GestALT AI Mentor
   Modes: 1=PASSIVE, 2=HINT, 3=COMMENTARY, 4=INTERVENTION
   Standalone (no ES module export) for games.html compatibility */

class VERASystem {
  constructor() {
    this.mode = 1;
    this.wrongCount = 0;
    this.hintUsed = false;
    this.interventionUsed = false;
    this.inactivityTimer = null;
    this.orbEl = null;
    this.commentEl = null;
    this.config = {};
    this.timing = {
      hintDelayMs: 45000,
      celebrationMs: 2600,
    };
  }

  init(config) {
    this.config = config || {};
    this.orbEl = document.getElementById(config.orbId || '');
    this.commentEl = document.getElementById(config.commentId || '');
    this.wrongCount = 0;
    this.hintUsed = false;
    this.interventionUsed = false;
    this.mode = 1;
    this._applyMode();
  }

  startTimer() {
    this._clearTimer();
    this.inactivityTimer = setTimeout(
      () => this.triggerHint(this.config.hintQuestion || 'What pattern do you notice?'),
      this.timing.hintDelayMs
    );
  }

  resetTimer() {
    this._clearTimer();
    this.startTimer();
  }

  _clearTimer() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
  }

  wrongAttempt() {
    this.wrongCount++;
    if (this.wrongCount >= 3 && !this.interventionUsed) {
      this.triggerIntervention();
    }
  }

  updateCommentary(text) {
    if (this.commentEl) {
      this.commentEl.textContent = '→ ' + text;
    }
  }

  triggerHint(question) {
    this.hintUsed = true;
    this.mode = 2;
    this._applyMode();
    this.updateCommentary(question);
  }

  triggerIntervention() {
    this.interventionUsed = true;
    this.mode = 4;
    this._applyMode();
    if (this.config.interventionText) {
      this.updateCommentary(this.config.interventionText);
    }
  }

  celebrate(message) {
    this.mode = 3;
    this._applyMode();

    const gameId = this._resolveGameId();
    const celebrationMap = window.VERACelebrations || {};
    const resolved = celebrationMap[gameId] || message || 'Excellent perception shift unlocked.';

    if (this.commentEl) {
      this.commentEl.textContent = resolved;
      this.commentEl.classList.add('vera-celebration-text');
    }

    if (this.orbEl) {
      this.orbEl.classList.add('vera-orb-celebration');
      this.orbEl.style.background = '#4ADE80';
    }

    setTimeout(() => {
      this.mode = 1;
      this._applyMode();
      if (this.commentEl) this.commentEl.classList.remove('vera-celebration-text');
      if (this.orbEl) this.orbEl.classList.remove('vera-orb-celebration');
    }, this.timing.celebrationMs);
  }

  _resolveGameId() {
    const configured = (this.config.gameId || '').toUpperCase();
    if (/^G\d{2}$/.test(configured)) return configured;
    const orbId = this.config.orbId || '';
    const m = orbId.match(/g(\d{1,2})/i);
    if (!m) return '';
    return `G${String(parseInt(m[1], 10)).padStart(2, '0')}`;
  }

  _applyMode() {
    if (!this.orbEl) return;
    this.orbEl.style.background = this.mode === 4 ? '#EF4444'
      : this.mode === 2 ? '#F59E0B'
      : '#6366F1';
  }

  wasHintUsed()         { return this.hintUsed; }
  wasInterventionUsed() { return this.interventionUsed; }
  getWrongCount()       { return this.wrongCount; }
}
