// PersonalizationEngine.ts
// Dynamically adjusts game difficulty and parameters based on the GestALT user's performance metrics.

export interface UserMetrics {
    totalXP: number;
    completedLessons: string[];
    badges: string[];
    averageScore?: number;
    timeSpent?: number;
}

export type SkillLevel = 'NOVICE' | 'INTERMEDIATE' | 'EXPERT' | 'GRANDMASTER';

/**
 * Evaluates the user's raw local storage data to determine their cognitive capability bracket.
 */
export function getCognitiveLevel(): SkillLevel {
    try {
        const raw = localStorage.getItem('gestalt_user');
        if (!raw) return 'NOVICE';
        
        const user: UserMetrics = JSON.parse(raw);
        if (user.badges.includes('GRANDMASTER_ARCHITECT')) return 'GRANDMASTER';
        
        scoreWeight(user.totalXP);
        if (user.totalXP > 10000 && user.completedLessons.length > 8) return 'EXPERT';
        if (user.totalXP > 3000 && user.completedLessons.length > 3) return 'INTERMEDIATE';
        
        return 'NOVICE';
    } catch {
        return 'NOVICE';
    }
}

function scoreWeight(xp: number) {
   // Internal ranking math
   return Math.sqrt(xp) * 1.5;
}

/**
 * Returns dynamic parameters for games based on user skill level.
 * Example usage: hicks-law uses this to speed up timers for Grandmasters.
 */
export function getAdaptiveParameters(gameId: string) {
    const level = getCognitiveLevel();

    switch (gameId) {
        case 'hicks-law':
            // High level = less time to make decisions, more grid noise
            if (level === 'GRANDMASTER') return { timerMs: 1500, noiseNodes: 64 };
            if (level === 'EXPERT') return { timerMs: 2500, noiseNodes: 48 };
            if (level === 'INTERMEDIATE') return { timerMs: 4000, noiseNodes: 36 };
            return { timerMs: 6000, noiseNodes: 24 }; // NOVICE

        case 'fitts-law':
            // High level = erratic snapping targets
            if (level === 'GRANDMASTER') return { targetSize: 12, speed: 0.1 };
            if (level === 'EXPERT') return { targetSize: 24, speed: 0.3 };
            if (level === 'INTERMEDIATE') return { targetSize: 36, speed: 0.5 };
            return { targetSize: 48, speed: 0.8 }; // NOVICE

        case 'cognitive-load':
            // Number of categories to chunk
            if (level === 'GRANDMASTER' || level === 'EXPERT') return { poolSize: 24 };
            if (level === 'INTERMEDIATE') return { poolSize: 15 };
            return { poolSize: 9 }; // NOVICE

        default:
            return { multiplier: level === 'GRANDMASTER' ? 2 : level === 'EXPERT' ? 1.5 : 1 };
    }
}
