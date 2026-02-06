// Domain Model: Challenge
export class Challenge {
    constructor(id, config) {
        this.id = id;
        this.title = config.title;
        this.description = config.description;
        this.domain = config.domain; // 'hierarchy', 'accessibility', 'forms', 'spacing'
        this.difficulty = config.difficulty; // 1-10
        this.components = config.components || [];
        this.goal = config.goal;
        this.constraints = config.constraints || [];
        this.successCriteria = config.successCriteria;
        this.estimatedTime = config.estimatedTime || 5;
    }

    evaluate(components, perceptionEngine) {
        const metrics = perceptionEngine.analyze(components);
        const score = this.calculateScore(metrics);
        const passed = this.checkSuccess(metrics);
        const explanation = this.generateExplanation(metrics, passed);

        return {
            passed,
            score,
            metrics,
            explanation
        };
    }

    calculateScore(metrics) {
        // Domain-specific scoring
        let score = 0;
        
        if (this.domain === 'hierarchy') {
            score += metrics.hierarchyStrength * 40;
            score += (1 - metrics.cognitiveLoad) * 30;
            score += metrics.firstAttentionCorrect ? 30 : 0;
        } else if (this.domain === 'accessibility') {
            score += metrics.contrastCompliance * 40;
            score += metrics.hitTargetCompliance * 30;
            score += metrics.keyboardNavigable ? 30 : 0;
        } else if (this.domain === 'spacing') {
            score += metrics.spacingConsistency * 50;
            score += (1 - metrics.visualNoise) * 50;
        }

        return Math.round(Math.max(0, Math.min(100, score)));
    }

    checkSuccess(metrics) {
        // Check all success criteria
        return this.successCriteria.every(criterion => {
            const [metric, operator, threshold] = criterion;
            const value = metrics[metric];
            
            switch(operator) {
                case '>': return value > threshold;
                case '>=': return value >= threshold;
                case '<': return value < threshold;
                case '<=': return value <= threshold;
                case '==': return value === threshold;
                default: return false;
            }
        });
    }

    generateExplanation(metrics, passed) {
        const explanations = [];
        
        if (this.domain === 'hierarchy' && metrics.hierarchyStrength < 0.6) {
            explanations.push({
                issue: 'Weak Visual Hierarchy',
                reason: `Hierarchy strength: ${(metrics.hierarchyStrength * 100).toFixed(0)}%`,
                suggestion: 'Increase size or weight difference between primary and secondary elements'
            });
        }

        if (metrics.cognitiveLoad > 0.7) {
            explanations.push({
                issue: 'High Cognitive Load',
                reason: `Processing difficulty: ${(metrics.cognitiveLoad * 100).toFixed(0)}%`,
                suggestion: 'Reduce visual complexity or improve information grouping'
            });
        }

        if (this.domain === 'accessibility') {
            if (metrics.contrastCompliance < 1) {
                explanations.push({
                    issue: 'Insufficient Color Contrast',
                    reason: `${metrics.failingContrasts.length} elements fail WCAG AA`,
                    suggestion: 'Increase contrast between text and background colors'
                });
            }

            if (metrics.hitTargetCompliance < 1) {
                explanations.push({
                    issue: 'Touch Targets Too Small',
                    reason: `${metrics.smallTargets.length} elements below 44×44px`,
                    suggestion: 'Increase button and interactive element sizes'
                });
            }
        }

        if (passed) {
            explanations.unshift({
                issue: 'Success',
                reason: 'All criteria met',
                suggestion: 'Challenge completed'
            });
        }

        return explanations;
    }
}
