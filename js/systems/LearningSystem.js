// Learning System - Adaptive Challenge Selection and User Tracking
import { User } from '../models/User.js';

export class LearningSystem {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'gestalt_user_profile';
        this.loadUser();
    }

    loadUser() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.currentUser = User.deserialize(stored);
        } else {
            this.currentUser = new User();
            this.saveUser();
        }
    }

    saveUser() {
        localStorage.setItem(this.storageKey, this.currentUser.serialize());
    }

    selectNextChallenge(availableChallenges) {
        // Adaptive selection based on user skill profile
        const weakestSkill = this.currentUser.getWeakestSkill();
        const strongestSkill = this.currentUser.getStrongestSkill();
        
        // Filter challenges by domain priority
        const priorityChallenges = availableChallenges.filter(c => c.domain === weakestSkill);
        const otherChallenges = availableChallenges.filter(c => c.domain !== weakestSkill);
        
        // 70% chance to reinforce weak skill, 30% for variety
        const pool = Math.random() < 0.7 && priorityChallenges.length > 0 
            ? priorityChallenges 
            : otherChallenges.length > 0 ? otherChallenges : availableChallenges;
        
        // Select difficulty based on skill level
        const skillLevel = this.currentUser.skillProfile[weakestSkill];
        const targetDifficulty = Math.ceil((skillLevel / 100) * 10);
        
        // Find challenge closest to target difficulty
        const challenge = pool.reduce((best, current) => {
            const currentDiff = Math.abs(current.difficulty - targetDifficulty);
            const bestDiff = Math.abs(best.difficulty - targetDifficulty);
            return currentDiff < bestDiff ? current : best;
        });
        
        return challenge;
    }

    recordDecision(challengeId, componentId, property, oldValue, newValue, timestamp) {
        const decision = {
            challengeId,
            componentId,
            property,
            oldValue,
            newValue,
            timestamp: timestamp || Date.now()
        };
        
        this.currentUser.recordDecision(decision);
        this.saveUser();
        
        return decision;
    }

    completeChallenge(challenge, performance) {
        // Update skill based on performance
        const skillDelta = this.calculateSkillDelta(performance);
        this.currentUser.updateSkill(challenge.domain, skillDelta);
        
        // Record completion
        this.currentUser.completeChallenge(challenge.id, performance);
        
        // Update streak
        if (performance.passed) {
            this.currentUser.currentStreak++;
        } else {
            this.currentUser.currentStreak = 0;
        }
        
        this.saveUser();
    }

    calculateSkillDelta(performance) {
        // More sophisticated than simple pass/fail
        const baseScore = performance.score;
        const timeBonus = performance.timeSpent < performance.estimatedTime ? 5 : 0;
        const hintPenalty = performance.hintsUsed * -2;
        
        let delta = 0;
        if (baseScore >= 90) delta = 10 + timeBonus;
        else if (baseScore >= 70) delta = 5 + timeBonus;
        else if (baseScore >= 50) delta = 2;
        else delta = -3;
        
        return delta + hintPenalty;
    }

    getInsights() {
        // Generate learning insights for the user
        const insights = [];
        
        const weakest = this.currentUser.getWeakestSkill();
        const weakestScore = this.currentUser.skillProfile[weakest];
        
        if (weakestScore < 30) {
            insights.push({
                type: 'focus-area',
                message: `Focus on ${this.formatSkillName(weakest)} - this is your growth opportunity`,
                domain: weakest
            });
        }
        
        if (this.currentUser.currentStreak >= 3) {
            insights.push({
                type: 'momentum',
                message: `${this.currentUser.currentStreak} challenges in a row - you're building strong patterns`,
                domain: null
            });
        }
        
        // Analyze hint usage patterns
        const avgHints = this.currentUser.completedChallenges.length > 0
            ? this.currentUser.hintUsage.total / this.currentUser.completedChallenges.length
            : 0;
        
        if (avgHints > 2) {
            insights.push({
                type: 'independence',
                message: 'Try solving the next challenge without hints - trust your instincts',
                domain: null
            });
        }
        
        return insights;
    }

    formatSkillName(skill) {
        const names = {
            hierarchy: 'Visual Hierarchy',
            accessibility: 'Accessibility',
            forms: 'Form Design',
            spacing: 'Spacing & Rhythm'
        };
        return names[skill] || skill;
    }

    getSkillProfile() {
        return { ...this.currentUser.skillProfile };
    }

    resetProgress() {
        this.currentUser = new User();
        this.saveUser();
    }
}
