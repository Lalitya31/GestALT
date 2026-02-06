// Main Application Entry Point
import { PerceptionEngine } from './engine/PerceptionEngine.js';
import { LearningSystem } from './systems/LearningSystem.js';
import { ChallengeRenderer } from './ui/ChallengeRenderer.js';
import { getAllChallenges } from './data/ChallengeLibrary.js';

class GestALTApp {
    constructor() {
        this.perceptionEngine = new PerceptionEngine();
        this.learningSystem = new LearningSystem();
        this.renderer = new ChallengeRenderer();
        this.currentChallenge = null;
        this.currentComponents = [];
        this.challengeStartTime = null;
        this.hintsUsed = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMicroChallenge();
    }

    setupMicroChallenge() {
        const demoBtns = document.querySelectorAll('.demo-btn');
        const feedback = document.querySelector('.challenge-feedback');
        const feedbackText = document.querySelector('.feedback-text');
        const canvas = document.getElementById('heatmapCanvas');
        
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        
        demoBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weight = btn.dataset.weight;
                
                // Show heatmap
                canvas.classList.add('active');
                this.drawHeatmap(ctx, canvas, btn, weight === 'high');
                
                // Show feedback
                setTimeout(() => {
                    feedback.classList.remove('hidden');
                    feedback.classList.add('visible');
                    
                    if (weight === 'high') {
                        feedbackText.textContent = '✓ Correct. Visual weight (size + contrast) drives attention. The primary button captures focus first.';
                    } else {
                        feedbackText.textContent = 'Most users click "Sign Up" first due to higher visual weight. Size and contrast create hierarchy.';
                    }
                }, 800);
            });
        });
    }
    
    drawHeatmap(ctx, canvas, targetBtn, isCorrect) {
        const rect = targetBtn.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const x = rect.left - canvasRect.left + rect.width / 2;
        const y = rect.top - canvasRect.top + rect.height / 2;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create radial gradient for heatmap effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 120);
        gradient.addColorStop(0, 'rgba(255, 100, 100, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 150, 100, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    setupEventListeners() {
        // Start learning button
        document.getElementById('startLearning')?.addEventListener('click', () => {
            this.showChallengeInterface();
        });

        // Exit challenge
        document.getElementById('exitChallenge')?.addEventListener('click', () => {
            this.exitChallenge();
        });

        // Evaluate design
        document.getElementById('evaluateDesign')?.addEventListener('click', () => {
            this.evaluateCurrentDesign();
        });
    }

    showChallengeInterface() {
        document.getElementById('landingPage').classList.add('hidden');
        document.getElementById('challengeInterface').classList.remove('hidden');
        this.loadFirstChallenge();
    }

    loadFirstChallenge() {
        const allChallenges = getAllChallenges();
        const firstChallenge = allChallenges[0];
        
        if (firstChallenge) {
            this.nextChallenge = firstChallenge;
            this.startChallenge();
        }
    }

    startChallenge() {
        if (!this.nextChallenge) return;
        
        this.currentChallenge = this.nextChallenge;
        this.currentComponents = [...this.currentChallenge.components];
        this.challengeStartTime = Date.now();
        this.hintsUsed = 0;
        
        // Render challenge
        document.getElementById('currentChallengeTitle').textContent = this.currentChallenge.title;
        document.getElementById('challengeInstruction').textContent = this.currentChallenge.description;
        
        this.renderer.render(this.currentComponents, this.onComponentUpdate.bind(this));
    }

    onComponentUpdate(componentId, property, value) {
        const component = this.currentComponents.find(c => c.id === componentId);
        if (component) {
            const oldValue = component.properties[property];
            component.updateProperty(property, value);
            
            // Record decision
            this.learningSystem.recordDecision(
                this.currentChallenge.id,
                componentId,
                property,
                oldValue,
                value
            );
            
            // Re-render
            this.renderer.render(this.currentComponents, this.onComponentUpdate.bind(this));
        }
    }

    evaluateCurrentDesign() {
        const result = this.currentChallenge.evaluate(this.currentComponents, this.perceptionEngine);
        
        // Show metrics
        this.displayMetrics(result.metrics);
        
        // Show explainability
        this.displayExplanation(result.explanation);
        
        // If passed, complete challenge
        if (result.passed) {
            const timeSpent = (Date.now() - this.challengeStartTime) / 60000; // minutes
            
            this.learningSystem.completeChallenge(this.currentChallenge, {
                passed: true,
                score: result.score,
                timeSpent,
                estimatedTime: this.currentChallenge.estimatedTime,
                hintsUsed: this.hintsUsed
            });
            
            setTimeout(() => {
                alert(`Challenge Completed! Score: ${result.score}/100`);
                this.exitChallenge();
            }, 2000);
        }
    }

    displayMetrics(metrics) {
        document.getElementById('perceptionMetrics').classList.remove('hidden');
        
        document.getElementById('metricAttention').textContent = 
            `${(metrics.attentionMap[0]?.attentionProbability * 100 || 0).toFixed(1)}%`;
        
        document.getElementById('metricHierarchy').textContent = 
            `${(metrics.hierarchyStrength * 100).toFixed(0)}%`;
        
        document.getElementById('metricCognitiveLoad').textContent = 
            `${(metrics.cognitiveLoad * 100).toFixed(0)}%`;
        
        document.getElementById('metricErrorRate').textContent = 
            `${(metrics.errorLikelihood * 100).toFixed(0)}%`;
        
        // Show accessibility report if relevant
        if (this.currentChallenge.domain === 'accessibility') {
            this.displayAccessibilityReport(metrics);
        }
    }

    displayAccessibilityReport(metrics) {
        const report = document.getElementById('accessibilityReport');
        const results = document.getElementById('a11yResults');
        report.classList.remove('hidden');
        
        let html = '';
        
        // Contrast
        html += `<div class="a11y-item ${metrics.contrastCompliance === 1 ? 'pass' : 'fail'}">`;
        html += `<strong>Color Contrast:</strong> ${(metrics.contrastCompliance * 100).toFixed(0)}% compliant`;
        if (metrics.failingContrasts.length > 0) {
            html += `<ul>`;
            metrics.failingContrasts.forEach(f => {
                html += `<li>Element ${f.id}: ${f.actual} (needs ${f.required})</li>`;
            });
            html += `</ul>`;
        }
        html += `</div>`;
        
        // Hit targets
        html += `<div class="a11y-item ${metrics.hitTargetCompliance === 1 ? 'pass' : 'fail'}">`;
        html += `<strong>Touch Targets:</strong> ${(metrics.hitTargetCompliance * 100).toFixed(0)}% compliant`;
        if (metrics.smallTargets.length > 0) {
            html += `<ul>`;
            metrics.smallTargets.forEach(t => {
                html += `<li>${t.id}: ${t.width}×${t.height}px (needs 44×44px)</li>`;
            });
            html += `</ul>`;
        }
        html += `</div>`;
        
        results.innerHTML = html;
    }

    displayExplanation(explanations) {
        const container = document.getElementById('explainability');
        
        let html = '<div class="explanation-list">';
        explanations.forEach(exp => {
            const cssClass = exp.issue === 'Success' ? 'success' : 'warning';
            html += `
                <div class="explanation-item ${cssClass}">
                    <h5>${exp.issue}</h5>
                    <p><strong>Reason:</strong> ${exp.reason}</p>
                    <p><strong>Action:</strong> ${exp.suggestion}</p>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    exitChallenge() {
        document.getElementById('challengeInterface').classList.add('hidden');
        document.getElementById('landingPage').classList.remove('hidden');
        
        this.currentChallenge = null;
        this.currentComponents = [];
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gestaltApp = new GestALTApp();
});
