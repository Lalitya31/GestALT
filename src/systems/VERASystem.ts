export interface VERAConfig {
  gameTitle?: string;
  principle?: string;
  hints?: string[];
  interventionContent?: {
    definition?: string;
    diagramFn?: (container: HTMLElement) => void;
    diagramSvg?: string;
    threeThings?: string[];
    workedExampleHtml?: string;
  };
}

export class VERASystem {
  private config: VERAConfig;
  private mode: 1 | 2 | 3 | 4 = 1;
  private wrongAttempts: number = 0;
  private timer: number | null = null;
  private container: HTMLElement | null = null;
  private commentaryTimeout: number | null = null;

  private orbEl!: HTMLElement;
  private hintPanelEl!: HTMLElement;
  private commentaryEl!: HTMLElement;
  private interventionPanelEl!: HTMLElement;

  private personalityLines = [
    "What does your eye land on first — and why?",
    "If you covered the labels, could you still tell what's interactive?",
    "How many decisions is this screen asking for at once?",
    "What would a first-time user assume about this element?",
    "Is the visual weight telling the right story?",
    "Which element is working hardest? Is that the right one?",
    "What would happen if you removed half of this?",
    "Does this feel like it belongs to a system — or is it alone?",
  ];

  constructor() {
    this.config = {};
  }

  init(config: VERAConfig = {}) {
    this.config = config;
    this.injectStyles();
    this.injectHTML();
    this.attachEvents();
    this.setMode(1);
    this.startTimer();
  }

  private injectStyles() {
    if (document.getElementById('vera-styles')) return;

    const style = document.createElement('style');
    style.id = 'vera-styles';
    style.textContent = `
      :root {
        --vera-primary: #6366F1;
        --vera-bg: #111111;
        --vera-success: #4ADE80;
        --vera-font-title: 'Fraunces', serif;
        --vera-font-body: 'Inter', sans-serif;
        --vera-font-mono: 'JetBrains Mono', monospace;
      }

      #vera-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-end;
      }

      /* Mode 1: Orb */
      #vera-orb {
        width: 28px;
        height: 28px;
        background: var(--vera-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: var(--vera-font-body);
        font-size: 12px;
        font-weight: bold;
        pointer-events: auto;
        cursor: pointer;
        animation: veraPulse 3s infinite ease-in-out;
        transition: background 0.3s ease, transform 0.3s ease;
        position: relative;
      }

      #vera-orb::before {
        content: "VERA — Visual Experience Research Assistant";
        position: absolute;
        right: 40px;
        background: var(--vera-bg);
        color: white;
        padding: 6px 10px;
        font-family: var(--vera-font-body);
        font-size: 11px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        border: 1px solid #2A2A2A;
      }

      #vera-orb:hover::before {
        opacity: 1;
      }

      @keyframes veraPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.08); }
        100% { transform: scale(1); }
      }

      /* Mode 3: Commentary */
      #vera-commentary {
        font-family: var(--vera-font-mono);
        font-size: 11px;
        color: #E0E0FF;
        margin-bottom: 12px;
        opacity: 0;
        transition: opacity 0.2s ease;
        background: rgba(17,17,17,0.8);
        padding: 4px 8px;
        border-left: 2px solid var(--vera-primary);
        pointer-events: none;
      }

      /* Mode 2: Hint Panel */
      #vera-hint-panel {
        position: absolute;
        bottom: 15px; /* right above orb */
        right: 0;
        width: 320px;
        background: var(--vera-bg);
        border-top: 1px solid var(--vera-primary);
        pointer-events: auto;
        transform: translateY(120%);
        opacity: 0;
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        display: none;
        flex-direction: column;
        padding: 24px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.8);
      }

      #vera-hint-panel.active {
        display: flex;
        transform: translateY(0);
        opacity: 1;
      }

      .vera-hint-header {
        font-family: var(--vera-font-mono);
        font-size: 11px;
        color: var(--vera-primary);
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .vera-hint-q {
        font-family: var(--vera-font-title);
        font-size: 22px;
        color: white;
        font-style: italic;
        line-height: 1.2;
        margin-bottom: 20px;
      }

      .vera-sep {
        height: 1px;
        background: #1E1E1E;
        width: 100%;
        margin-bottom: 16px;
      }

      .vera-btn {
        background: none;
        border: none;
        color: white;
        font-family: var(--vera-font-body);
        font-size: 13px;
        cursor: pointer;
        padding: 8px 0;
        text-align: left;
        transition: color 0.2s ease;
      }
      .vera-btn:hover {
        color: var(--vera-primary);
      }
      .vera-btn-primary {
        color: var(--vera-primary);
        font-weight: bold;
      }

      /* Mode 4: Intervention Panel */
      #vera-intervention-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 380px;
        height: 100vh;
        background: var(--vera-bg);
        border-left: 1px solid var(--vera-primary);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.35s ease-out;
        display: flex;
        flex-direction: column;
        pointer-events: auto;
        box-shadow: -20px 0 50px rgba(0,0,0,0.8);
        overflow-y: auto;
      }

      #vera-intervention-panel.active {
        transform: translateX(0);
      }

      .vera-int-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 32px;
        border-bottom: 1px solid #1E1E1E;
      }

      .vera-int-tag {
        font-family: var(--vera-font-mono);
        color: var(--vera-primary);
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      .vera-close {
        color: white;
        font-family: var(--vera-font-body);
        font-size: 16px;
        cursor: pointer;
        background: none;
        border: none;
      }

      .vera-int-body {
        padding: 32px;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .vera-int-title {
        font-family: var(--vera-font-title);
        font-size: 28px;
        color: white;
        margin-bottom: 8px;
      }

      .vera-int-def {
        font-family: var(--vera-font-body);
        font-size: 16px;
        color: #E0E0FF;
        line-height: 1.5;
        margin-bottom: 24px;
      }

      .vera-int-diagram {
        height: 180px;
        background: #080808;
        border: 1px solid #1E1E1E;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
        position: relative;
        overflow: hidden;
      }

      .vera-int-label {
        font-family: var(--vera-font-body);
        font-size: 10px;
        color: var(--vera-primary);
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 16px;
      }

      .vera-int-bullets {
        list-style: none;
        padding: 0;
        margin: 0 0 24px 0;
      }

      .vera-int-bullets li {
        font-family: var(--vera-font-body);
        font-size: 14px;
        color: white;
        margin-bottom: 12px;
        display: flex;
        line-height: 1.4;
      }

      .vera-int-bullets li::before {
        content: "→";
        color: var(--vera-primary);
        margin-right: 12px;
        font-weight: bold;
      }

      .vera-got-it {
        width: 100%;
        background: var(--vera-primary);
        color: white;
        font-family: var(--vera-font-body);
        font-size: 14px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 4px;
        padding: 20px 0;
        border: none;
        cursor: pointer;
        transition: background 0.2s ease;
        margin-top: auto;
      }
      .vera-got-it:hover {
        background: white;
        color: black;
      }
    `;
    document.head.appendChild(style);
  }

  private injectHTML() {
    if (document.getElementById('vera-container')) {
      this.container = document.getElementById('vera-container');
    } else {
      this.container = document.createElement('div');
      this.container.id = 'vera-container';
      document.body.appendChild(this.container);
    }

    if (!this.container) return;

    this.container.innerHTML = `
      <div id="vera-commentary"></div>
      <div id="vera-hint-panel">
        <div class="vera-hint-header">VERA — Hint Mode</div>
        <div class="vera-hint-q" id="vera-hint-text"></div>
        <div class="vera-sep"></div>
        <button class="vera-btn vera-btn-primary" id="vera-btn-more">I need more help →</button>
        <button class="vera-btn" id="vera-btn-good">I'm good</button>
      </div>
      <div id="vera-orb">V</div>
    `;

    this.orbEl = document.getElementById('vera-orb')!;
    this.hintPanelEl = document.getElementById('vera-hint-panel')!;
    this.commentaryEl = document.getElementById('vera-commentary')!;

    // Intervention Panel
    if (!document.getElementById('vera-intervention-panel')) {
      const intPanel = document.createElement('div');
      intPanel.id = 'vera-intervention-panel';
      intPanel.innerHTML = `
        <div class="vera-int-header">
           <span class="vera-int-tag">VERA — LEARNING MOMENT</span>
           <button class="vera-close" id="vera-int-close">×</button>
        </div>
        <div class="vera-int-body">
           <div class="vera-int-title" id="vera-int-title">Principle Name</div>
           <div class="vera-int-def" id="vera-int-def">Definition context here.</div>
           <div class="vera-sep"></div>
           <div class="vera-int-diagram" id="vera-int-diagram"></div>
           <div class="vera-int-label">THREE THINGS TO KNOW:</div>
           <ul class="vera-int-bullets" id="vera-int-bullets"></ul>
           <div class="vera-sep"></div>
           <div class="vera-int-label">TRY THIS:</div>
           <div id="vera-int-exercise"></div>
        </div>
        <button class="vera-got-it" id="vera-int-got-it">GOT IT →</button>
      `;
      document.body.appendChild(intPanel);
    }
    this.interventionPanelEl = document.getElementById('vera-intervention-panel')!;
  }

  private attachEvents() {
    document.getElementById('vera-orb')?.addEventListener('click', () => {
      this.triggerHint();
    });

    document.getElementById('vera-btn-more')?.addEventListener('click', () => {
      this.triggerIntervention();
    });

    document.getElementById('vera-btn-good')?.addEventListener('click', () => {
      this.setMode(1);
    });

    document.getElementById('vera-int-close')?.addEventListener('click', () => {
      this.setMode(1);
    });

    document.getElementById('vera-int-got-it')?.addEventListener('click', () => {
      this.setMode(1);
    });

    // Reset timer on global interaction
    window.addEventListener('mousemove', this.resetTimer.bind(this));
    window.addEventListener('keydown', this.resetTimer.bind(this));
    window.addEventListener('click', this.resetTimer.bind(this));
  }

  private setMode(newMode: 1 | 2 | 3 | 4) {
    this.mode = newMode;
    
    // Reset visually
    this.hintPanelEl.classList.remove('active');
    this.interventionPanelEl.classList.remove('active');
    
    if (this.mode === 1) {
      this.orbEl.style.opacity = '1';
    } 
    else if (this.mode === 2) {
      this.hintPanelEl.classList.add('active');
    }
    else if (this.mode === 3) {
      // Handled via updateCommentary
    }
    else if (this.mode === 4) {
      this.populateIntervention();
      this.interventionPanelEl.classList.add('active');
      this.hintPanelEl.classList.remove('active'); // Hide hint if open
    }
  }

  // --- Public API ---

  public startTimer() {
    this.resetTimer();
  }

  public resetTimer() {
    if (this.timer) clearTimeout(this.timer);
    if (this.mode === 2 || this.mode === 4) return; // Don't trigger if already in a focused mode
    
    this.timer = window.setTimeout(() => {
      this.triggerHint();
    }, 45000); // 45s inactivity
  }

  public wrongAttempt() {
    this.wrongAttempts++;
    if (this.wrongAttempts >= 3) {
      this.triggerIntervention();
      this.wrongAttempts = 0;
    }
  }

  public updateCommentary(text: string) {
    if (this.mode === 2 || this.mode === 4) return;
    this.mode = 3;
    const truncated = text.length > 60 ? text.substring(0, 57) + '...' : text;
    this.commentaryEl.innerText = truncated;
    this.commentaryEl.style.opacity = '1';

    if (this.commentaryTimeout) clearTimeout(this.commentaryTimeout);
    this.commentaryTimeout = window.setTimeout(() => {
      this.commentaryEl.style.opacity = '0';
      this.mode = 1;
    }, 4000);
  }

  public triggerHint(questionText?: string) {
    let q = questionText;
    if (!q) {
      // Pick random from personality lines or config hints
      const source = (this.config.hints && this.config.hints.length > 0) ? this.config.hints : this.personalityLines;
      q = source[Math.floor(Math.random() * source.length)];
    }
    document.getElementById('vera-hint-text')!.innerText = q;
    this.setMode(2);
  }

  public triggerIntervention() {
    this.setMode(4);
  }

  public celebrate(message?: string) {
    this.orbEl.style.background = 'var(--vera-success)';
    this.orbEl.style.transform = 'scale(1.2)';
    this.orbEl.innerText = '✓';
    
    if (message) {
      this.updateCommentary(message);
    }

    setTimeout(() => {
      this.orbEl.style.background = 'var(--vera-primary)';
      this.orbEl.style.transform = 'scale(1)';
      this.orbEl.innerText = 'V';
    }, 2000);
  }

  private populateIntervention() {
    const c = this.config.interventionContent || {};
    
    document.getElementById('vera-int-title')!.innerText = this.config.principle || 'Design Principle';
    document.getElementById('vera-int-def')!.innerText = c.definition || 'An essential heuristic for measuring cognitive interaction constraints.';
    
    const diagramEl = document.getElementById('vera-int-diagram')!;
    diagramEl.innerHTML = '';
    if (c.diagramFn) {
      c.diagramFn(diagramEl);
    } else if (c.diagramSvg) {
      diagramEl.innerHTML = c.diagramSvg;
    } else {
      diagramEl.innerHTML = `<div style="color: #6366F1; font-family: monospace; opacity: 0.5;">[ SYSTEM DIAGRAM NOT PROVIDED ]</div>`;
    }

    const bulletsEl = document.getElementById('vera-int-bullets')!;
    bulletsEl.innerHTML = '';
    const items = c.threeThings || [
      "Missing context causes high cognitive friction.",
      "Visual hierarchy dictates scanning order.",
      "The aesthetic-usability effect forces form to match function."
    ];
    items.forEach(text => {
      const li = document.createElement('li');
      li.innerText = text;
      bulletsEl.appendChild(li);
    });

    const exerciseEl = document.getElementById('vera-int-exercise')!;
    exerciseEl.innerHTML = c.workedExampleHtml || `<div style="padding: 16px; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); text-align: center; color: rgba(255,255,255,0.5); font-size: 12px; font-style: italic;">No interactive example provided by current module.</div>`;
  }
}
