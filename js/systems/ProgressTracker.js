// Progress Tracker - Tracks user learning progress and statistics

export class ProgressTracker {
    constructor() {
        this.loadProgress();
    }

    loadProgress() {
        const saved = localStorage.getItem('gestalt_progress');
        if (saved) {
            this.progress = JSON.parse(saved);
        } else {
            this.progress = this.getDefaultProgress();
        }
    }

    getDefaultProgress() {
        return {
            userId: this.generateUserId(),
            startDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            
            stats: {
                hierarchy: 0,
                accessibility: 0,
                decisionSpeed: 0,
                cognitiveLoad: 0,
                spacing: 0,
                color: 0,
                typography: 0
            },
            
            completedChallenges: [],
            attemptHistory: [],
            
            totalXP: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            
            mistakes: [],          // Track common mistakes for personalization
            strengths: [],
            weaknesses: [],
            
            preferredLearningStyle: null,  // Adaptive: visual, hands-on, theory-first
            
            achievements: []
        };
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    recordChallengeAttempt(challengeId, result) {
        const attempt = {
            challengeId,
            timestamp: new Date().toISOString(),
            score: result.score,
            timeElapsed: result.timeElapsed,
            cluesUsed: result.cluesUsed,
            modifications: result.modifications,
            metrics: {
                cognitiveLoad: result.cognitiveLoadReduction,
                constraints: result.constraintImprovement,
                improvement: result.improvementScore,
                efficiency: result.efficiencyScore
            }
        };
        
        this.progress.attemptHistory.push(attempt);
        
        // Update stats based on performance
        this.updateStats(result);
        
        // Check if challenge completed successfully
        if (result.score >= 60) {
            if (!this.progress.completedChallenges.includes(challengeId)) {
                this.progress.completedChallenges.push(challengeId);
                this.progress.totalXP += Math.round(result.score * 10);
            }
        }
        
        // Update streak
        this.updateStreak();
        
        // Analyze mistakes and strengths
        this.analyzeMistakes(result);
        
        // Save progress
        this.save();
    }

    updateStats(result) {
        const { cognitiveLoadReduction, constraintImprovement } = result;
        
        // Incremental improvement based on performance
        if (cognitiveLoadReduction > 60) {
            this.progress.stats.cognitiveLoad = Math.min(100, this.progress.stats.cognitiveLoad + 5);
        }
        
        if (constraintImprovement > 60) {
            this.progress.stats.accessibility = Math.min(100, this.progress.stats.accessibility + 5);
        }
        
        // Update hierarchy based on label and structure improvements
        this.progress.stats.hierarchy = Math.min(100, this.progress.stats.hierarchy + 3);
        
        // Update decision speed based on time and clues
        if (result.efficiencyScore > 70) {
            this.progress.stats.decisionSpeed = Math.min(100, this.progress.stats.decisionSpeed + 4);
        }
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastActive = new Date(this.progress.lastActive).toDateString();
        
        if (today === lastActive) {
            // Same day, don't update streak
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastActive === yesterdayStr) {
            // Consecutive day
            this.progress.currentStreak++;
        } else {
            // Streak broken
            this.progress.currentStreak = 1;
        }
        
        this.progress.longestStreak = Math.max(this.progress.longestStreak, this.progress.currentStreak);
        this.progress.lastActive = new Date().toISOString();
    }

    analyzeMistakes(result) {
        // Track patterns in mistakes for personalized recommendations
        const { modifications } = result;
        
        // Check for common issues
        modifications.forEach(mod => {
            if (mod.property === 'fontSize' && parseInt(mod.value) < 14) {
                this.trackMistake('font_size_too_small');
            }
            
            if (mod.property === 'padding' && parseInt(mod.value) < 10) {
                this.trackMistake('insufficient_spacing');
            }
            
            if (mod.property === 'text' && mod.value.toLowerCase() === mod.value) {
                this.trackMistake('improper_capitalization');
            }
        });
        
        // Identify strengths
        if (result.cognitiveLoadReduction > 80) {
            this.trackStrength('cognitive_load_management');
        }
        
        if (result.constraintImprovement > 80) {
            this.trackStrength('accessibility_awareness');
        }
    }

    trackMistake(mistakeType) {
        const existing = this.progress.mistakes.find(m => m.type === mistakeType);
        if (existing) {
            existing.count++;
            existing.lastOccurrence = new Date().toISOString();
        } else {
            this.progress.mistakes.push({
                type: mistakeType,
                count: 1,
                firstOccurrence: new Date().toISOString(),
                lastOccurrence: new Date().toISOString()
            });
        }
    }

    trackStrength(strengthType) {
        if (!this.progress.strengths.includes(strengthType)) {
            this.progress.strengths.push(strengthType);
        }
    }

    getRecommendations() {
        const recommendations = [];
        
        // Recommend based on weaknesses
        const weakStats = Object.entries(this.progress.stats)
            .filter(([key, value]) => value < 50)
            .sort((a, b) => a[1] - b[1]);
        
        weakStats.forEach(([skill, value]) => {
            recommendations.push({
                type: 'weakness',
                skill,
                currentLevel: value,
                reason: `Your ${skill} score is ${value}%. Practice more challenges in this area.`
            });
        });
        
        // Recommend based on common mistakes
        const frequentMistakes = this.progress.mistakes
            .filter(m => m.count >= 3)
            .sort((a, b) => b.count - a.count);
        
        frequentMistakes.forEach(mistake => {
            recommendations.push({
                type: 'mistake_pattern',
                mistake: mistake.type,
                count: mistake.count,
                reason: `You've made ${mistake.count} mistakes related to ${mistake.type.replace(/_/g, ' ')}.`
            });
        });
        
        return recommendations;
    }

    getInsights() {
        return {
            strengths: this.progress.strengths.map(s => this.formatStrength(s)),
            improvements: this.getImprovementInsights(),
            focusAreas: this.getFocusAreas()
        };
    }

    formatStrength(strength) {
        const descriptions = {
            'cognitive_load_management': 'Strong ability to reduce cognitive load in designs',
            'accessibility_awareness': 'Excellent understanding of accessibility requirements',
            'visual_hierarchy': 'Good grasp of visual hierarchy principles'
        };
        
        return descriptions[strength] || strength.replace(/_/g, ' ');
    }

    getImprovementInsights() {
        const insights = [];
        const recentAttempts = this.progress.attemptHistory.slice(-5);
        
        if (recentAttempts.length >= 2) {
            const avgRecent = recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length;
            const allAttempts = this.progress.attemptHistory;
            const avgAll = allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length;
            
            const improvement = ((avgRecent - avgAll) / avgAll) * 100;
            
            if (improvement > 10) {
                insights.push(`Performance improving by ${Math.round(improvement)}% in recent challenges`);
            }
        }
        
        // Check clue usage
        const recentClues = recentAttempts.map(a => a.cluesUsed);
        const avgClues = recentClues.reduce((sum, c) => sum + c, 0) / recentClues.length;
        
        if (avgClues < 1) {
            insights.push('Using fewer clues - showing increased confidence');
        }
        
        return insights;
    }

    getFocusAreas() {
        const areas = [];
        
        // Based on stats
        const stats = this.progress.stats;
        
        if (stats.accessibility < 60) {
            areas.push('Practice more with accessibility constraints and WCAG guidelines');
        }
        
        if (stats.spacing < 60) {
            areas.push('Focus on spacing and layout challenges');
        }
        
        if (stats.color < 60) {
            areas.push('Work on color contrast and theory');
        }
        
        // Based on mistakes
        const frequentMistakes = this.progress.mistakes
            .filter(m => m.count >= 3)
            .map(m => m.type);
        
        if (frequentMistakes.includes('font_size_too_small')) {
            areas.push('Review typography best practices');
        }
        
        return areas;
    }

    save() {
        localStorage.setItem('gestalt_progress', JSON.stringify(this.progress));
    }

    getProgress() {
        return this.progress;
    }

    reset() {
        this.progress = this.getDefaultProgress();
        this.save();
    }
}
