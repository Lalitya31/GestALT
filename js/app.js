// GestALT Application - Main Controller
import { PerceptionEngine } from './engine/PerceptionEngine.js';
import { LearningSystem } from './systems/LearningSystem.js';
import { ScoringSystem } from './systems/ScoringSystem.js';
import { ProgressTracker } from './systems/ProgressTracker.js';
import { OnboardingData } from './data/OnboardingData.js';
import { ChallengeData } from './data/ChallengeData.js';

class GestALTApp {
    constructor() {
        this.perceptionEngine = new PerceptionEngine();
        this.learningSystem = new LearningSystem();
        this.scoringSystem = new ScoringSystem();
        this.progressTracker = new ProgressTracker();
        
        this.currentPage = 'creativeLogin';
        this.userData = {
            name: '',
            email: '',
            completedLessons: [],
            stats: {
                hierarchy: 0,
                accessibility: 0,
                decisionSpeed: 0,
                cognitiveLoad: 0
            },
            totalXP: 0,
            currentStreak: 0
        };
        
        this.challengeState = {
            startTime: null,
            cluesUsed: 0,
            modifications: [],
            currentChallenge: null
        };
        
        this.init();
    }

    init() {
        this.setupCreativeLogin();
        this.setupOnboarding();
        this.setupChallengeScreen();
        this.setupResultsScreen();
        this.setupDashboard();
    }

    // ============================================
    // CREATIVE LOGIN PAGE
    // ============================================
    
    setupCreativeLogin() {
        const loginCanvas = document.getElementById('loginCanvas');
        const submitBtn = document.getElementById('submitLogin');
        const proceedBtn = document.getElementById('proceedToOnboarding');
        
        if (!loginCanvas) return;

        // Setup drag and drop
        this.setupDragAndDrop();
        
        // Submit evaluation
        submitBtn?.addEventListener('click', () => this.evaluateLogin());
        proceedBtn?.addEventListener('click', () => this.navigateTo('onboardingPage'));
    }

    setupDragAndDrop() {
        const draggables = document.querySelectorAll('.draggable');
        const dropZones = document.querySelectorAll('[data-drop-target]');
        
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', draggable.dataset.element);
                draggable.classList.add('dragging');
            });
            
            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
            });
        });
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                const elementType = e.dataTransfer.getData('text/plain');
                const expectedType = zone.dataset.dropTarget;
                
                if (elementType === expectedType) {
                    this.handleDrop(zone, elementType);
                }
            });
        });
    }

    handleDrop(zone, elementType) {
        const placeholder = zone.querySelector('.placeholder-text');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        zone.classList.add('filled');
        
        if (elementType === 'email') {
            const emailInput = document.querySelector('.email-input').cloneNode(true);
            zone.appendChild(emailInput);
        } else if (elementType === 'button') {
            const button = document.querySelector('.cta-button-draggable').cloneNode(true);
            button.draggable = false;
            zone.appendChild(button);
            
            // Show formatting toolbar
            const toolbar = document.getElementById('buttonToolbar');
            toolbar?.classList.remove('hidden');
            
            // Setup toolbar controls
            this.setupButtonFormatting(button);
        }
    }

    setupButtonFormatting(button) {
        const sizeSelect = document.querySelector('.btn-size');
        const styleSelect = document.querySelector('.btn-style');
        
        sizeSelect?.addEventListener('change', (e) => {
            button.classList.remove('small', 'medium', 'large');
            button.classList.add(e.target.value);
        });
        
        styleSelect?.addEventListener('change', (e) => {
            button.classList.remove('primary', 'secondary', 'ghost');
            button.classList.add(e.target.value);
        });
    }

    evaluateLogin() {
        const nameInput = document.querySelector('.name-input');
        const emailZone = document.querySelector('[data-drop-target="email"]');
        const buttonZone = document.querySelector('[data-drop-target="button"]');
        const feedbackDiv = document.getElementById('loginFeedback');
        const metricsDiv = feedbackDiv?.querySelector('.feedback-metrics');
        const suggestionsDiv = feedbackDiv?.querySelector('.feedback-suggestions');
        const proceedBtn = document.getElementById('proceedToOnboarding');
        
        // Evaluate based on UI/UX rules
        let score = 0;
        let maxScore = 100;
        const feedback = [];
        const suggestions = [];
        
        // Check name entry
        if (nameInput?.textContent.trim()) {
            score += 20;
            feedback.push('✓ Name entered correctly');
        } else {
            suggestions.push('Add your name in the heading');
        }
        
        // Check email placement
        if (emailZone?.classList.contains('filled')) {
            score += 20;
            feedback.push('✓ Email placed in correct position');
            
            // Check visual hierarchy
            const emailInput = emailZone.querySelector('input');
            if (emailInput) {
                score += 10;
                feedback.push('✓ Email follows heading hierarchy');
            }
        } else {
            suggestions.push('Drag the email field to the subheading area');
        }
        
        // Check button placement and formatting
        if (buttonZone?.classList.contains('filled')) {
            score += 20;
            feedback.push('✓ CTA button placed correctly');
            
            const button = buttonZone.querySelector('button');
            if (button) {
                // Check button styling
                if (button.classList.contains('primary')) {
                    score += 15;
                    feedback.push('✓ Primary CTA style - good contrast');
                } else if (button.classList.contains('secondary')) {
                    score += 10;
                    feedback.push('~ Secondary style - less emphasis than ideal');
                }
                
                // Check button size
                if (button.classList.contains('large') || button.classList.contains('medium')) {
                    score += 15;
                    feedback.push('✓ Button size appropriate for primary action');
                } else {
                    score += 5;
                    suggestions.push('Consider larger button size for primary CTA');
                }
            }
        } else {
            suggestions.push('Drag and format the Sign In button');
        }
        
        // Display feedback
        if (metricsDiv) {
            metricsDiv.innerHTML = `
                <div class="score-display">
                    <strong>Score: ${score}/${maxScore}</strong>
                </div>
                <ul style="margin-top: 1rem;">
                    ${feedback.map(f => `<li>${f}</li>`).join('')}
                </ul>
            `;
        }
        
        if (suggestionsDiv && suggestions.length > 0) {
            suggestionsDiv.innerHTML = `
                <h4>Suggestions:</h4>
                <ul>
                    ${suggestions.map(s => `<li>${s}</li>`).join('')}
                </ul>
            `;
        }
        
        feedbackDiv?.classList.remove('hidden');
        
        // Allow proceed if score is reasonable
        if (score >= 60) {
            proceedBtn?.classList.remove('hidden');
            this.userData.name = nameInput?.textContent.trim() || 'Learner';
            this.userData.email = document.querySelector('.email-input')?.value || '';
        }
    }

    // ============================================
    // ONBOARDING PAGE
    // ============================================
    
    setupOnboarding() {
        const proceedBtn = document.getElementById('proceedToChallenges');
        proceedBtn?.addEventListener('click', () => this.navigateTo('challengeScreen'));
        
        // Load onboarding UI options when page becomes active
        this.loadOnboardingContent();
    }

    loadOnboardingContent() {
        const optionsGrid = document.getElementById('uiOptionsGrid');
        if (!optionsGrid) return;
        
        // Sample onboarding scenario
        const scenario = {
            question: "Which login form follows best practices?",
            options: [
                {
                    id: 1,
                    correct: false,
                    html: '<input type="text" placeholder="email" style="width:100%;padding:5px;"><input type="password" placeholder="password" style="width:100%;padding:5px;margin-top:5px;"><button style="padding:5px;">login</button>',
                    issues: ['Poor contrast', 'Small touch targets', 'No labels']
                },
                {
                    id: 2,
                    correct: false,
                    html: '<div style="font-size:10px;">Email</div><input type="text" style="width:100%;padding:3px;"><div style="font-size:10px;">Password</div><input type="password" style="width:100%;padding:3px;"><button style="padding:3px;font-size:10px;">Submit</button>',
                    issues: ['Text too small', 'Touch targets too small']
                },
                {
                    id: 3,
                    correct: true,
                    html: '<label style="display:block;margin-bottom:0.5rem;font-weight:600;">Email</label><input type="email" style="width:100%;padding:0.75rem;border:2px solid #ccc;border-radius:6px;font-size:1rem;"><label style="display:block;margin:1rem 0 0.5rem;font-weight:600;">Password</label><input type="password" style="width:100%;padding:0.75rem;border:2px solid #ccc;border-radius:6px;font-size:1rem;"><button style="margin-top:1rem;width:100%;padding:0.875rem;background:#6366F1;color:white;border:none;border-radius:6px;font-size:1rem;font-weight:600;cursor:pointer;">Sign In</button>',
                    principle: 'Fitts\' Law & Accessibility',
                    explanation: 'Larger touch targets, clear labels, good contrast, and appropriate spacing reduce cognitive load and errors.'
                },
                {
                    id: 4,
                    correct: false,
                    html: '<div style="text-align:center;"><input type="text" placeholder="email/username/phone" style="width:80%;padding:0.5rem;"><br><input type="password" style="width:80%;padding:0.5rem;margin-top:0.5rem;"><br><button style="margin-top:0.5rem;padding:0.5rem;background:gray;color:white;">GO</button></div>',
                    issues: ['Ambiguous placeholder', 'Poor button label', 'Inconsistent widths']
                }
            ],
            reasons: [
                { text: 'It has larger clickable areas', correct: true },
                { text: 'It looks modern', correct: false },
                { text: 'It uses proper labels and contrast', correct: true },
                { text: 'It has animations', correct: false }
            ]
        };
        
        // Render UI options
        optionsGrid.innerHTML = scenario.options.map(option => `
            <div class="ui-option" data-option-id="${option.id}">
                <div class="ui-preview">
                    ${option.html}
                </div>
            </div>
        `).join('');
        
        // Setup click handlers
        optionsGrid.querySelectorAll('.ui-option').forEach(option => {
            option.addEventListener('click', () => {
                this.handleUISelection(option, scenario);
            });
        });
    }

    handleUISelection(selectedOption, scenario) {
        const optionId = parseInt(selectedOption.dataset.optionId);
        const option = scenario.options.find(o => o.id === optionId);
        
        // Clear previous selections
        document.querySelectorAll('.ui-option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        selectedOption.classList.add('selected');
        
        if (option.correct) {
            selectedOption.classList.add('correct');
            this.showReasonSelection(scenario, option);
        } else {
            selectedOption.classList.add('incorrect');
            setTimeout(() => {
                selectedOption.classList.remove('incorrect');
            }, 1000);
        }
    }

    showReasonSelection(scenario, correctOption) {
        const explanationSection = document.getElementById('explanationSection');
        const reasonOptions = document.getElementById('reasonOptions');
        
        if (!explanationSection || !reasonOptions) return;
        
        explanationSection.classList.remove('hidden');
        
        reasonOptions.innerHTML = scenario.reasons.map((reason, idx) => `
            <div class="reason-option" data-reason-idx="${idx}">
                ${reason.text}
            </div>
        `).join('');
        
        reasonOptions.querySelectorAll('.reason-option').forEach(reasonOpt => {
            reasonOpt.addEventListener('click', () => {
                const idx = parseInt(reasonOpt.dataset.reasonIdx);
                const reason = scenario.reasons[idx];
                
                reasonOpt.classList.add('selected');
                
                if (reason.correct) {
                    reasonOpt.classList.add('correct');
                    setTimeout(() => {
                        this.showPrinciple(correctOption);
                    }, 500);
                } else {
                    reasonOpt.classList.add('incorrect');
                    setTimeout(() => {
                        reasonOpt.classList.remove('selected', 'incorrect');
                    }, 1000);
                }
            });
        });
    }

    showPrinciple(correctOption) {
        const principleReveal = document.getElementById('principleReveal');
        if (!principleReveal) return;
        
        principleReveal.classList.remove('hidden');
        
        const titleEl = principleReveal.querySelector('.principle-title');
        const descEl = principleReveal.querySelector('.principle-description');
        
        if (titleEl) titleEl.textContent = correctOption.principle;
        if (descEl) descEl.textContent = correctOption.explanation;
    }

    // ============================================
    // CHALLENGE SCREEN
    // ============================================
    
    setupChallengeScreen() {
        const clueBtn = document.getElementById('clueBtn');
        const submitBtn = document.getElementById('submitChallenge');
        const continueBtn = document.getElementById('continuelearning');
        
        clueBtn?.addEventListener('click', () => this.showClue());
        submitBtn?.addEventListener('click', () => this.submitChallenge());
        continueBtn?.addEventListener('click', () => this.loadNextChallenge());
        
        // Start timer when challenge loads
        this.startChallengeTimer();
        
        // Load a challenge
        this.loadChallenge();
    }

    startChallengeTimer() {
        this.challengeState.startTime = Date.now();
        
        const timerEl = document.getElementById('timerValue');
        if (!timerEl) return;
        
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.challengeState.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    loadChallenge() {
        // Sample challenge: Fix a poorly designed form
        const challenge = {
            title: "Fix the Registration Form",
            difficulty: "Intermediate",
            instruction: "Improve this form's usability and accessibility",
            elements: [
                {
                    id: 'label1',
                    type: 'label',
                    text: 'name',
                    issues: ['no-capital', 'needs-colon'],
                    correct: { text: 'Name:', fontSize: '14px', fontWeight: '600' }
                },
                {
                    id: 'input1',
                    type: 'input',
                    issues: ['too-small', 'poor-contrast'],
                    correct: { padding: '12px', fontSize: '16px', border: '2px solid #ccc' }
                },
                {
                    id: 'button1',
                    type: 'button',
                    text: 'submit',
                    issues: ['poor-label', 'too-small', 'poor-contrast'],
                    correct: { text: 'Create Account', padding: '14px 28px', background: '#6366F1', color: '#fff' }
                }
            ]
        };
        
        this.challengeState.currentChallenge = challenge;
        
        const titleEl = document.getElementById('challengeTitle');
        const difficultyEl = document.getElementById('difficultyBadge');
        const instructionsEl = document.getElementById('canvasInstructions');
        const canvas = document.getElementById('uiCanvas');
        
        if (titleEl) titleEl.textContent = challenge.title;
        if (difficultyEl) difficultyEl.textContent = challenge.difficulty;
        if (instructionsEl) instructionsEl.textContent = challenge.instruction;
        
        if (canvas) {
            canvas.innerHTML = this.renderChallengeUI(challenge.elements);
            this.setupElementSelection();
        }
    }

    renderChallengeUI(elements) {
        return `
            <div style="max-width: 400px;">
                <div class="ui-element" data-element-id="label1" style="font-size: 12px; margin-bottom: 0.25rem;">
                    name
                </div>
                <input class="ui-element" data-element-id="input1" type="text" style="width: 100%; padding: 6px; font-size: 14px; border: 1px solid #ddd; margin-bottom: 1rem;">
                <button class="ui-element" data-element-id="button1" style="padding: 8px 16px; background: #ccc; color: #666; border: none; font-size: 13px;">
                    submit
                </button>
            </div>
        `;
    }

    setupElementSelection() {
        const elements = document.querySelectorAll('.ui-element');
        const propertyEditor = document.getElementById('propertyEditor');
        const propertyControls = document.getElementById('propertyControls');
        
        elements.forEach(el => {
            el.addEventListener('click', () => {
                // Clear previous selection
                elements.forEach(e => e.classList.remove('selected'));
                el.classList.add('selected');
                
                // Show property editor
                propertyEditor?.classList.remove('hidden');
                
                // Populate controls based on element type
                if (propertyControls) {
                    propertyControls.innerHTML = this.getPropertyControls(el);
                    this.bindPropertyControls(el);
                }
            });
        });
    }

    getPropertyControls(element) {
        const elementType = element.tagName.toLowerCase();
        
        let controls = `
            <div class="property-control">
                <label>Font Size</label>
                <input type="number" class="ctrl-font-size" value="14" min="10" max="24">
            </div>
        `;
        
        if (elementType === 'button') {
            controls += `
                <div class="property-control">
                    <label>Padding</label>
                    <input type="text" class="ctrl-padding" value="8px 16px">
                </div>
                <div class="property-control">
                    <label>Background</label>
                    <input type="color" class="ctrl-background" value="#cccccc">
                </div>
                <div class="property-control">
                    <label>Text Color</label>
                    <input type="color" class="ctrl-color" value="#666666">
                </div>
                <div class="property-control">
                    <label>Label</label>
                    <input type="text" class="ctrl-text" value="${element.textContent.trim()}">
                </div>
            `;
        }
        
        if (elementType === 'input') {
            controls += `
                <div class="property-control">
                    <label>Padding</label>
                    <input type="text" class="ctrl-padding" value="6px">
                </div>
                <div class="property-control">
                    <label>Border</label>
                    <input type="text" class="ctrl-border" value="1px solid #ddd">
                </div>
            `;
        }
        
        return controls;
    }

    bindPropertyControls(element) {
        const controls = document.getElementById('propertyControls');
        if (!controls) return;
        
        // Font size
        const fontSizeCtrl = controls.querySelector('.ctrl-font-size');
        fontSizeCtrl?.addEventListener('input', (e) => {
            element.style.fontSize = e.target.value + 'px';
            this.recordModification(element, 'fontSize', e.target.value);
        });
        
        // Padding
        const paddingCtrl = controls.querySelector('.ctrl-padding');
        paddingCtrl?.addEventListener('input', (e) => {
            element.style.padding = e.target.value;
            this.recordModification(element, 'padding', e.target.value);
        });
        
        // Background
        const bgCtrl = controls.querySelector('.ctrl-background');
        bgCtrl?.addEventListener('input', (e) => {
            element.style.background = e.target.value;
            this.recordModification(element, 'background', e.target.value);
        });
        
        // Text color
        const colorCtrl = controls.querySelector('.ctrl-color');
        colorCtrl?.addEventListener('input', (e) => {
            element.style.color = e.target.value;
            this.recordModification(element, 'color', e.target.value);
        });
        
        // Text content
        const textCtrl = controls.querySelector('.ctrl-text');
        textCtrl?.addEventListener('input', (e) => {
            element.textContent = e.target.value;
            this.recordModification(element, 'text', e.target.value);
        });
        
        // Border
        const borderCtrl = controls.querySelector('.ctrl-border');
        borderCtrl?.addEventListener('input', (e) => {
            element.style.border = e.target.value;
            this.recordModification(element, 'border', e.target.value);
        });
    }

    recordModification(element, property, value) {
        this.challengeState.modifications.push({
            elementId: element.dataset.elementId,
            property,
            value,
            timestamp: Date.now()
        });
    }

    showClue() {
        const cluePanel = document.getElementById('cluePanel');
        const cluesRemaining = document.getElementById('cluesRemaining');
        
        if (this.challengeState.cluesUsed >= 3) {
            alert('No more clues available!');
            return;
        }
        
        const clues = [
            "Start with the button - make it stand out as the primary action",
            "Labels should be capitalized and have proper punctuation",
            "Input fields need larger padding and better borders for accessibility"
        ];
        
        if (cluePanel) {
            cluePanel.classList.remove('hidden');
            cluePanel.querySelector('.clue-text').textContent = clues[this.challengeState.cluesUsed];
        }
        
        this.challengeState.cluesUsed++;
        if (cluesRemaining) {
            cluesRemaining.textContent = 3 - this.challengeState.cluesUsed;
        }
        
        setTimeout(() => {
            cluePanel?.classList.add('hidden');
        }, 5000);
    }

    submitChallenge() {
        clearInterval(this.timerInterval);
        
        const timeElapsed = Math.floor((Date.now() - this.challengeState.startTime) / 1000);
        
        // Calculate scores
        const scores = this.scoringSystem.calculateChallengeScore({
            modifications: this.challengeState.modifications,
            timeElapsed,
            cluesUsed: this.challengeState.cluesUsed,
            challenge: this.challengeState.currentChallenge
        });
        
        // Store results
        this.challengeResults = {
            ...scores,
            timeElapsed
        };
        
        // Navigate to results
        this.navigateTo('resultsScreen');
        this.displayResults();
    }

    // ============================================
    // RESULTS SCREEN
    // ============================================
    
    setupResultsScreen() {
        const proceedBtn = document.getElementById('proceedToDashboard');
        proceedBtn?.addEventListener('click', () => {
            this.saveProgress();
            this.navigateTo('dashboardPage');
            this.updateDashboard();
        });
    }

    displayResults() {
        if (!this.challengeResults) return;
        
        const { score, cognitiveLoadReduction, constraintImprovement, previousAttempts } = this.challengeResults;
        const timeElapsed = this.challengeResults.timeElapsed;
        
        // Display score
        const scoreEl = document.getElementById('finalScore');
        if (scoreEl) {
            scoreEl.textContent = Math.round(score);
        }
        
        // Display metrics
        document.getElementById('cognitiveLoadReduction').textContent = Math.round(cognitiveLoadReduction);
        document.getElementById('constraintScore').textContent = Math.round(constraintImprovement);
        
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        document.getElementById('timeTaken').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const improvement = previousAttempts > 0 ? Math.round(score - previousAttempts) : 0;
        document.getElementById('improvementPercent').textContent = Math.max(0, improvement);
        
        // XP calculation
        const xpGained = Math.round(score * 10);
        document.getElementById('xpGained').textContent = xpGained;
        this.userData.totalXP += xpGained;
        
        // Animate XP bar
        const xpFill = document.getElementById('xpFill');
        if (xpFill) {
            setTimeout(() => {
                xpFill.style.width = (score % 100) + '%';
            }, 500);
        }
        
        // Generate heatmap
        this.drawResultsHeatmap();
        
        // Display theories
        this.displayTheories();
    }

    drawResultsHeatmap() {
        const canvas = document.getElementById('resultsHeatmap');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 400;
        
        // Simple heatmap visualization
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, 200
        );
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.5)');
        gradient.addColorStop(1, 'rgba(74, 222, 128, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    displayTheories() {
        const theoriesContainer = document.getElementById('theoryExplanations');
        if (!theoriesContainer) return;
        
        const theories = [
            {
                title: "Fitts' Law",
                explanation: "Larger interactive elements are easier and faster to click. Your button improvements reduced user error likelihood."
            },
            {
                title: "Visual Hierarchy",
                explanation: "Proper labeling and capitalization guide user attention to important information first."
            },
            {
                title: "WCAG Accessibility",
                explanation: "Adequate padding and border contrast ensure the interface is usable for everyone, including those with motor or visual impairments."
            }
        ];
        
        theoriesContainer.innerHTML = theories.map(theory => `
            <div class="theory-item">
                <div class="theory-title">${theory.title}</div>
                <div class="theory-explanation">${theory.explanation}</div>
            </div>
        `).join('');
    }

    // ============================================
    // DASHBOARD
    // ============================================
    
    setupDashboard() {
        this.updateDashboard();
    }

    updateDashboard() {
        // Update stats
        document.getElementById('totalXP').textContent = this.userData.totalXP;
        document.getElementById('lessonsCompleted').textContent = this.userData.completedLessons.length;
        document.getElementById('currentStreak').textContent = this.userData.currentStreak;
        
        // Update progress bars
        this.updateProgressBars();
        
        // Load lessons
        this.loadLessons();
        
        // Load recommendations
        this.loadRecommendations();
        
        // Load insights
        this.loadInsights();
    }

    updateProgressBars() {
        const stats = this.userData.stats;
        
        document.getElementById('hierarchyPercent').textContent = stats.hierarchy + '%';
        document.getElementById('hierarchyProgress').style.width = stats.hierarchy + '%';
        
        document.getElementById('accessibilityPercent').textContent = stats.accessibility + '%';
        document.getElementById('accessibilityProgress').style.width = stats.accessibility + '%';
        
        document.getElementById('decisionSpeedPercent').textContent = stats.decisionSpeed + '%';
        document.getElementById('decisionSpeedProgress').style.width = stats.decisionSpeed + '%';
        
        document.getElementById('cognitivePercent').textContent = stats.cognitiveLoad + '%';
        document.getElementById('cognitiveProgress').style.width = stats.cognitiveLoad + '%';
    }

    loadLessons() {
        const lessonsGrid = document.getElementById('lessonsGrid');
        if (!lessonsGrid) return;
        
        const lessons = [
            { title: 'Visual Hierarchy Basics', score: 85, theory: 'Gestalt Principles' },
            { title: 'Button Design', score: 78, theory: 'Fitts\' Law' },
            { title: 'Form Accessibility', score: 92, theory: 'WCAG Guidelines' }
        ];
        
        lessonsGrid.innerHTML = lessons.map(lesson => `
            <div class="lesson-card">
                <h3 class="lesson-title">${lesson.title}</h3>
                <div class="lesson-score">${lesson.score}</div>
                <a href="#" class="lesson-theory-link">→ ${lesson.theory}</a>
            </div>
        `).join('');
    }

    loadRecommendations() {
        const recsGrid = document.getElementById('recommendationsGrid');
        if (!recsGrid) return;
        
        const recommendations = [
            {
                title: 'Color Contrast',
                reason: 'Based on your accessibility scores, practice color theory'
            },
            {
                title: 'Spacing & Rhythm',
                reason: 'Improve cognitive load management with better spacing'
            }
        ];
        
        recsGrid.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <h3 class="recommendation-title">${rec.title}</h3>
                <p class="recommendation-reason">${rec.reason}</p>
            </div>
        `).join('');
    }

    loadInsights() {
        const strengthsList = document.getElementById('strengthsList');
        const improvementsList = document.getElementById('improvementsList');
        const focusList = document.getElementById('focusAreasList');
        
        if (strengthsList) {
            strengthsList.innerHTML = `
                <li>Strong grasp of visual hierarchy principles</li>
                <li>Consistent improvement in decision speed</li>
            `;
        }
        
        if (improvementsList) {
            improvementsList.innerHTML = `
                <li>Color contrast detection improving by 15%</li>
                <li>Reduced clue usage in recent challenges</li>
            `;
        }
        
        if (focusList) {
            focusList.innerHTML = `
                <li>Practice more with complex form layouts</li>
                <li>Focus on accessibility constraints</li>
            `;
        }
    }

    loadNextChallenge() {
        // Reset challenge state
        this.challengeState = {
            startTime: null,
            cluesUsed: 0,
            modifications: [],
            currentChallenge: null
        };
        
        this.navigateTo('challengeScreen');
        this.loadChallenge();
        this.startChallengeTimer();
    }

    saveProgress() {
        // Save to localStorage
        localStorage.setItem('gestalt_user_data', JSON.stringify(this.userData));
        
        // Update stats based on challenge performance
        if (this.challengeResults) {
            this.userData.stats.hierarchy = Math.min(100, this.userData.stats.hierarchy + 5);
            this.userData.stats.accessibility = Math.min(100, this.userData.stats.accessibility + 3);
            this.userData.stats.decisionSpeed = Math.min(100, this.userData.stats.decisionSpeed + 4);
            this.userData.stats.cognitiveLoad = Math.min(100, this.userData.stats.cognitiveLoad + 4);
        }
    }

    // ============================================
    // NAVIGATION
    // ============================================
    
    navigateTo(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gestaltApp = new GestALTApp();
});

export default GestALTApp;
