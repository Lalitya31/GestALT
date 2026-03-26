/**
 * GestALT Gamification Engine
 * Handles XP scaling, achievements, streaks, and performance rankings.
 */

export interface UserGamificationState {
  totalXP: number;
  currentLevel: number;
  streakDays: number;
  lastLoginDate: string;
  badges: string[];
  stats: {
    hierarchy: number;
    accessibility: number;
    decisionSpeed: number;
    cognitiveLoad: number;
  };
  completedLessons: string[];
}

// Base levels (0-based indices)
// Lvl 1: 0 XP
// Lvl 2: 1000 XP
// Lvl 3: 2500 XP
// Lvl 4: 5000 XP
const XP_THRESHOLDS = [0, 1000, 2500, 5000, 8500, 13000, 19000, 27000, 37000, 50000];

export const BADGE_DEFS = {
  CONTRAST_GUARDIAN: { id: 'CONTRAST_GUARDIAN', name: 'Contrast Guardian', desc: 'Achieved 100% WCAG AA score on a challenge.', icon: 'Eye' },
  FITTS_MASTER: { id: 'FITTS_MASTER', name: 'Fitts Master', desc: 'Optimized touch targets perfectly.', icon: 'Target' },
  SPEED_DEMON: { id: 'SPEED_DEMON', name: 'Speed Demon', desc: 'Completed a challenge in under 30 seconds with S-Rank.', icon: 'Zap' },
  HIERARCHY_EXPERT: { id: 'HIERARCHY_EXPERT', name: 'Hierarchy Expert', desc: 'Mastered visual weighting.', icon: 'Layers' },
}

export const GamificationSystem = {

  calculateLevel: (xp: number): number => {
    let level = 1;
    for (let i = 0; i < XP_THRESHOLDS.length; i++) {
      if (xp >= XP_THRESHOLDS[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    return level;
  },

  getXpForNextLevel: (xp: number): number => {
    const currentLvl = GamificationSystem.calculateLevel(xp);
    if (currentLvl >= XP_THRESHOLDS.length) return 0; // Max level
    return XP_THRESHOLDS[currentLvl];
  },

  calculateRank: (score: number, timeElapsed: number): 'S' | 'A' | 'B' | 'C' => {
    // S-Rank requires perfect score and fast time
    if (score >= 95 && timeElapsed < 45) return 'S';
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    return 'C';
  },

  calculateXPReward: (score: number, rank: 'S'|'A'|'B'|'C', timeElapsed: number): number => {
    let baseXP = score * 10;
    // Rank Multipliers
    if (rank === 'S') baseXP *= 1.5;
    if (rank === 'A') baseXP *= 1.2;
    if (rank === 'B') baseXP *= 1.0;
    if (rank === 'C') baseXP *= 0.5;

    // Time Bonus
    if (timeElapsed < 30) baseXP += 200;
    else if (timeElapsed < 60) baseXP += 100;

    return Math.round(baseXP);
  },

  evaluateBadges: (state: UserGamificationState, challengeResults: any): string[] => {
    const newBadges: string[] = [];
    const { score, timeElapsed, metrics } = challengeResults;

    // Contrast Guardian
    if (metrics?.contrast >= 4.5 && !state.badges.includes('CONTRAST_GUARDIAN')) {
      newBadges.push('CONTRAST_GUARDIAN');
    }

    // Fitts Master
    if (metrics?.fittsLawTarget >= 44 && !state.badges.includes('FITTS_MASTER')) {
      newBadges.push('FITTS_MASTER');
    }

    // Speed Demon
    if (timeElapsed < 30 && score >= 90 && !state.badges.includes('SPEED_DEMON')) {
      newBadges.push('SPEED_DEMON');
    }

    return newBadges;
  }
};
