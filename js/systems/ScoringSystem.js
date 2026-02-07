// Scoring System - Evaluates based on learning-focused criteria
// Points for reducing cognitive load, improving constraints, and learning progress

export class ScoringSystem {
    constructor() {
        this.weights = {
            cognitiveLoad: 0.35,      // Reducing cognitive load is key
            constraints: 0.30,         // Meeting accessibility/usability constraints
            improvement: 0.20,         // Improvement over previous attempts
            efficiency: 0.15           // Time and clue usage
        };
    }

    calculateChallengeScore(data) {
        const { modifications, timeElapsed, cluesUsed, challenge } = data;
        
        // Calculate individual components
        const cognitiveLoadReduction = this.calculateCognitiveLoadReduction(modifications, challenge);
        const constraintImprovement = this.calculateConstraintImprovement(modifications, challenge);
        const improvementScore = this.calculateImprovement(challenge);
        const efficiencyScore = this.calculateEfficiency(timeElapsed, cluesUsed);
        
        // Weighted total score
        const totalScore = (
            cognitiveLoadReduction * this.weights.cognitiveLoad +
            constraintImprovement * this.weights.constraints +
            improvementScore * this.weights.improvement +
            efficiencyScore * this.weights.efficiency
        );
        
        return {
            score: totalScore,
            cognitiveLoadReduction,
            constraintImprovement,
            improvementScore,
            efficiencyScore,
            breakdown: {
                cognitiveLoad: cognitiveLoadReduction * this.weights.cognitiveLoad,
                constraints: constraintImprovement * this.weights.constraints,
                improvement: improvementScore * this.weights.improvement,
                efficiency: efficiencyScore * this.weights.efficiency
            },
            previousAttempts: 0 // TODO: Track from history
        };
    }

    calculateCognitiveLoadReduction(modifications, challenge) {
        let score = 0;
        const maxScore = 100;
        
        modifications.forEach(mod => {
            const element = challenge.elements.find(el => el.id === mod.elementId);
            if (!element) return;
            
            // Check if modification addresses cognitive load issues
            if (mod.property === 'fontSize' && parseInt(mod.value) >= 16) {
                score += 15; // Readable font size
            }
            
            if (mod.property === 'padding') {
                const paddingValue = parseInt(mod.value);
                if (paddingValue >= 12) {
                    score += 15; // Better touch targets
                }
            }
            
            if (mod.property === 'text') {
                // Check for proper capitalization and clear labels
                if (mod.value.charAt(0) === mod.value.charAt(0).toUpperCase()) {
                    score += 10; // Proper capitalization
                }
                if (mod.value.length > 3 && !mod.value.toLowerCase().includes('submit')) {
                    score += 10; // Descriptive labels
                }
            }
            
            if (mod.property === 'border') {
                if (mod.value.includes('2px') || mod.value.includes('3px')) {
                    score += 10; // Clear boundaries
                }
            }
        });
        
        return Math.min(maxScore, score);
    }

    calculateConstraintImprovement(modifications, challenge) {
        let score = 0;
        const maxScore = 100;
        
        modifications.forEach(mod => {
            // Accessibility constraints
            if (mod.property === 'color' || mod.property === 'background') {
                score += 15; // Attempted to improve contrast
            }
            
            // WCAG touch target size (44x44px minimum)
            if (mod.property === 'padding') {
                const paddingValue = parseInt(mod.value);
                if (paddingValue >= 14) {
                    score += 20; // Meets WCAG touch target guidelines
                }
            }
            
            // Proper labeling for screen readers
            if (mod.property === 'text') {
                if (mod.value.match(/^[A-Z]/) && mod.value.length > 2) {
                    score += 15; // Proper labels
                }
            }
        });
        
        return Math.min(maxScore, score);
    }

    calculateImprovement(challenge) {
        // TODO: Compare with previous attempts from localStorage
        // For now, return base score
        return 50;
    }

    calculateEfficiency(timeElapsed, cluesUsed) {
        let score = 100;
        
        // Deduct points for excessive time (but not too harshly - learning takes time)
        if (timeElapsed > 300) { // 5 minutes
            score -= Math.min(30, (timeElapsed - 300) / 10);
        }
        
        // Deduct points for clues (but clues are okay - they're learning tools)
        score -= cluesUsed * 10;
        
        return Math.max(0, score);
    }

    // Evaluate login page
    evaluateLoginDesign(elements) {
        let score = 0;
        const feedback = [];
        const issues = [];
        
        // Check visual hierarchy
        const hasName = elements.name && elements.name.trim().length > 0;
        const hasEmail = elements.email && elements.email.trim().length > 0;
        const hasButton = elements.button;
        
        if (hasName) {
            score += 20;
            feedback.push('Name entered');
        } else {
            issues.push('Name missing');
        }
        
        if (hasEmail) {
            score += 20;
            feedback.push('Email provided');
            
            // Check email position
            if (elements.emailPosition === 'correct') {
                score += 15;
                feedback.push('Email correctly positioned');
            }
        } else {
            issues.push('Email missing or misplaced');
        }
        
        if (hasButton) {
            score += 20;
            feedback.push('CTA button present');
            
            // Check button properties
            if (elements.buttonStyle === 'primary') {
                score += 15;
                feedback.push('Primary CTA style - good emphasis');
            }
            
            if (elements.buttonSize === 'large' || elements.buttonSize === 'medium') {
                score += 10;
                feedback.push('Appropriate button size');
            }
        } else {
            issues.push('CTA button missing');
        }
        
        return {
            score,
            feedback,
            issues,
            passed: score >= 60
        };
    }
}
